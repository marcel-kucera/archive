package main

import (
	"advmw"
	"errors"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type FileOwnerInfo struct {
	FileKey  string    `json:"fileKey" db:"fileKey"`
	FileName string    `json:"fileName" db:"fileName"`
	UserId   uuid.UUID `json:"userId" db:"userId"`
}

type FileOwnerNameInfo struct {
	FileKey  string `json:"fileKey" db:"fileKey"`
	FileName string `json:"fileName" db:"fileName"`
	UserName string `json:"userName" db:"name"`
}

type IFileOwnerRepo interface {
	Add(FileOwnerInfo) advmw.AppError
	GetByKey(key string) (FileOwnerInfo, advmw.AppError)
	GetWithNameByKey(key string) (FileOwnerNameInfo, advmw.AppError)
	GetByUser(userid string) ([]FileOwnerInfo, advmw.AppError)
	Delete(key string) advmw.AppError
}

type FileOwnerRepo struct {
	Db *sqlx.DB
}

func (r *FileOwnerRepo) Add(info FileOwnerInfo) advmw.AppError {
	_, err := r.Db.Exec("INSERT INTO fileOwnerInfo (fileKey,fileName,userId) VALUES (?,?,?)", info.FileKey, info.FileName, info.UserId)
	if err != nil {
		return advmw.NewDbError(err)
	}
	return nil
}

func (r *FileOwnerRepo) GetByKey(key string) (FileOwnerInfo, advmw.AppError) {
	var info FileOwnerInfo
	err := r.Db.Get(&info, "SELECT fileKey,fileName,userId FROM fileOwnerInfo WHERE fileKey = ?", key)
	if err != nil {
		return info, advmw.NewDbError(err)
	}
	return info, nil
}

func (r *FileOwnerRepo) GetWithNameByKey(key string) (FileOwnerNameInfo, advmw.AppError) {
	var info FileOwnerNameInfo
	err := r.Db.Get(&info, "SELECT i.fileKey,i.fileName,u.name FROM fileOwnerInfo i JOIN user u ON i.userId = u.id WHERE fileKey = ?", key)
	if err != nil {
		return info, advmw.NewDbError(err)
	}
	return info, nil
}

func (r *FileOwnerRepo) Delete(key string) advmw.AppError {
	res, err := r.Db.Exec("DELETE FROM fileOwnerInfo WHERE fileKey = ?", key)
	if err != nil {
		return advmw.NewDbError(err)
	}
	i, err := res.RowsAffected()
	if err != nil {
		return nil
	}
	if i != 1 {
		return advmw.NewNotFoundError(errors.New("info with key not found"), "file")
	}
	return nil
}

func (r *FileOwnerRepo) GetByUser(userid string) ([]FileOwnerInfo, advmw.AppError) {
	var infos []FileOwnerInfo
	err := r.Db.Select(&infos, "SELECT fileKey,fileName,userId FROM fileOwnerInfo WHERE userId = ?", userid)
	if err != nil {
		return infos, advmw.NewDbError(err)
	}
	return infos, nil
}
