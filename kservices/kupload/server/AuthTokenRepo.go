package main

import (
	"advmw"
	"database/sql"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type IAuthTokenRepo interface {
	Generate(uuid.UUID) (uuid.UUID, advmw.AppError)
	Get(uuid.UUID) (uuid.UUID, advmw.AppError)
}

type AuthTokenRepo struct {
	Db *sqlx.DB
}

func (r *AuthTokenRepo) Generate(userid uuid.UUID) (uuid.UUID, advmw.AppError) {
	token := uuid.New()
	_, err := r.Db.Exec("INSERT INTO authToken (token,userId) VALUES (?,?)", token, userid)
	if err != nil {
		return uuid.Nil, advmw.NewDbError(err)
	}
	return token, nil
}

func (r *AuthTokenRepo) Get(token uuid.UUID) (uuid.UUID, advmw.AppError) {
	var userIdString string
	err := r.Db.Get(&userIdString, "SELECT userid FROM authToken WHERE token=?", token)
	if err == sql.ErrNoRows {
		return uuid.Nil, advmw.NewUnauthorizedError(err)
	}
	if err != nil {
		return uuid.Nil, advmw.NewDbError(err)
	}
	userId, err := uuid.Parse(userIdString)
	if err != nil {
		return uuid.Nil, advmw.NewCustomError("malformed token", 400, err)
	}
	return userId, nil
}
