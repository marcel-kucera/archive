package main

import (
	"database/sql"
)

type DB struct {
	Db *sql.DB
}

func (db *DB) InsertFile(filename string, id string) error {
	_, err := db.Db.Exec("INSERT INTO files (filename,id) VALUES (?,?);", filename, id)
	return err
}

func (db *DB) GetFilename(id string) (string, error) {
	var filename string
	err := db.Db.QueryRow("SELECT filename FROM files WHERE id=?", id).Scan(&filename)
	return filename, err
}

func (db *DB) GenerateTable() error {
	_, err := db.Db.Exec(`
	CREATE TABLE IF NOT EXISTS files(
		id TEXT PRIMARY KEY,
		filename TEXT NOT NULL
	);`)
	return err
}
