package main

import (
	"database/sql"
	"errors"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

var db *DB

func uploadFile(w http.ResponseWriter, r *http.Request) {
	mReader, err := r.MultipartReader()
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	part, err := getUploadPart(mReader)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}

	filename := part.FileName()
	id := uuid.New()

	path := fmt.Sprintf("./upload/%s", id)
	file, err := os.Create(path)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	_, err = io.Copy(file, part)
	if err != nil {
		os.Remove(path)
		http.Error(w, err.Error(), 500)
		return
	}
	db.InsertFile(filename, fmt.Sprint(id))
	if err != nil {
		os.Remove(path)
		http.Error(w, err.Error(), 500)
		return
	}

	remoteIp := strings.Split(r.RemoteAddr, ":")[0]
	log.Printf("%s: uploaded \"%s\" with id \"%s\"\n", remoteIp, filename, id)

	fmt.Fprint(w, id)
}

func downloadFile(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "no file specified", 500)
		return
	}

	path := fmt.Sprintf("./upload/%s", id)
	file, err := os.Open(path)
	if err != nil {
		http.Error(w, "cant find file", 400)
		return
	}

	filename, err := db.GetFilename(id)
	if err != nil {
		http.Error(w, "cant find file", 400)
		return
	}

	buffer := make([]byte, 512)
	file.Read(buffer)
	contentType := http.DetectContentType(buffer)
	file.Seek(0, 0)

	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Type", contentType)
	stat, _ := file.Stat()
	w.Header().Set("Content-Length", fmt.Sprint(stat.Size()))

	remoteIp := strings.Split(r.RemoteAddr, ":")[0]
	log.Printf("%s: downloaded \"%s\" with id \"%s\"\n", remoteIp, filename, id)

	io.Copy(w, file)
}

func setupRoutes() {
	http.HandleFunc("/upload", middleware(uploadFile))
	http.HandleFunc("/download", middleware(downloadFile))
	http.ListenAndServe(":8080", nil)
}

func main() {
	log.SetOutput(os.Stdout)

	log.Println("Starting Database")
	sqlite, err := sql.Open("sqlite3", "file:test.db?cache=shared")
	if err != nil {
		panic(err)
	}
	db = &DB{Db: sqlite}
	err = db.GenerateTable()
	if err != nil {
		panic(err)
	}
	log.Println("Starting Server")
	os.Mkdir("./upload", 0777)
	setupRoutes()
}

func getUploadPart(r *multipart.Reader) (*multipart.Part, error) {
	for {
		part, err := r.NextPart()
		if err != nil {
			if err == io.EOF {
				break
			} else {
				return nil, err
			}
		}
		if part.FormName() != "upload" {
			continue
		}
		if part.FileName() == "" {
			return nil, errors.New("upload is not a file")
		}
		return part, nil
	}
	return nil, errors.New("no upload found in form")
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == "OPTIONS" {
			return
		}
		next(w, r)
	}
}

func logging(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		remoteIp := strings.Split(r.RemoteAddr, ":")[0]
		log.Printf("%s: %s %s\n", remoteIp, r.Method, r.RequestURI)
		next(w, r)
	}
}

func middleware(next http.HandlerFunc) http.HandlerFunc {
	return logging(cors(next))
}
