package main

import (
	"advmw"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"strings"

	"github.com/google/uuid"
)

type IFileStore interface {
	GetFile(key string) (file io.Reader, sErr advmw.AppError)
	GetFileSize(key string) (size int64, sErr advmw.AppError)
	StoreFile(file io.Reader) (key string, sErr advmw.AppError)
	DeleteFile(key string) advmw.AppError
}

type FileStore struct {
	Dir string
}

// Returns the path where the named file should be stored
func (s *FileStore) getPath(file string) string {
	root := strings.TrimRight(s.Dir, "/")
	return fmt.Sprintf("%s/%s", root, file)
}

func (s *FileStore) GetFile(key string) (file io.Reader, sErr advmw.AppError) {
	stream, err := os.Open(s.getPath(key))
	if err != nil {
		return nil, advmw.NewNotFoundError(err, "file")
	}
	return stream, nil
}

func (s *FileStore) GetFileSize(key string) (size int64, sErr advmw.AppError) {
	info, err := os.Stat(s.getPath(key))
	if err != nil {
		return 0, advmw.NewNotFoundError(err, "file")
	}

	return info.Size(), nil
}

func (s *FileStore) StoreFile(file io.Reader) (key string, sErr advmw.AppError) {
	key = uuid.NewString()
	filepath := s.getPath(key)

	_, err := os.Stat(filepath)
	if err == nil {
		return "", advmw.NewUndefinedError(errors.New("duplicate uuid :P"))
	}
	if !errors.Is(err, fs.ErrNotExist) {
		return "", advmw.NewUndefinedError(err)
	}

	storefile, err := os.Create(filepath)
	if err != nil {
		return "", advmw.NewUndefinedError(err)
	}

	_, err = io.Copy(storefile, file)
	if err != nil {
		os.Remove(filepath)
		return "", advmw.NewUndefinedError(err)
	}

	return key, nil
}

func (s *FileStore) DeleteFile(key string) advmw.AppError {
	err := os.Remove(s.getPath(key))
	if err != nil {
		if errors.Is(err, fs.ErrExist) {
			return advmw.NewNotFoundError(err, "file")
		}
		return advmw.NewUndefinedError(err)
	}
	return nil
}
