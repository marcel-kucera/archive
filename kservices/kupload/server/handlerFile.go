package main

import (
	"advmw"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

func Upload(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	// Setup multipart reader
	read, err := r.MultipartReader()
	if err != nil {
		return advmw.NewFormError(err)
	}

	// WARNING this can be empty
	user, _ := UserFromContext(r.Context())

	// Loop over all parts
	for {
		part, err := read.NextPart()
		if err != nil {
			return advmw.NewFormError(err)
		}

		// Store if upload is found in form, error when not
		name := part.FileName()
		if part.FormName() == "upload" && name != "" {
			key, sErr := srv.FileStore.StoreFile(part)
			if sErr != nil {
				return sErr
			}

			// userid will be 00000000-0000-0000-0000-000000000000 when no user is logged in and should be shown as anonymous
			sErr = srv.FileOwnerInfo.Add(FileOwnerInfo{
				FileKey:  key,
				FileName: name,
				UserId:   user.Id,
			})
			if sErr != nil {
				return sErr
			}

			fmt.Fprint(w, key)
			break
		}
	}
	return nil // only reached when successful
}

func Download(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	key := r.URL.Query().Get("key")
	if key == "" {
		return advmw.NewFormError(errors.New("no key specified"))
	}

	info, sErr := srv.FileOwnerInfo.GetByKey(key)
	if sErr != nil {
		return sErr
	}
	size, sErr := srv.FileStore.GetFileSize(key)
	if sErr != nil {
		return sErr
	}

	data, sErr := srv.FileStore.GetFile(key)
	if sErr != nil {
		return sErr
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", info.FileName))
	w.Header().Set("Content-Length", fmt.Sprint(size))
	_, err := io.Copy(w, data)
	if err != nil {
		return advmw.NewUndefinedError(err)
	}
	return nil
}

type FileInfoData struct {
	Name  string `json:"name"`
	Owner string `json:"owner"`
	Size  int64  `json:"size"`
}

func FileInfo(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	key := r.URL.Query().Get("key")
	if key == "" {
		return advmw.NewFormError(errors.New("no key specified"))
	}

	size, sErr := srv.FileStore.GetFileSize(key)
	if sErr != nil {
		return sErr
	}
	info, sErr := srv.FileOwnerInfo.GetWithNameByKey(key)
	if sErr != nil {
		return sErr
	}
	data := FileInfoData{
		Size:  size,
		Name:  info.FileName,
		Owner: info.UserName,
	}
	json.NewEncoder(w).Encode(data)
	return nil
}

func MyFiles(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	user, sErr := UserFromContext(r.Context())
	if sErr != nil {
		return sErr
	}

	files, sErr := srv.FileOwnerInfo.GetByUser(user.Id.String())
	if sErr != nil {
		return sErr
	}

	data, err := json.Marshal(files)
	if err != nil {
		return advmw.NewUndefinedError(err)
	}
	fmt.Fprint(w, string(data))
	return nil
}
