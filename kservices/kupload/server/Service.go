package main

import (
	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

type Service struct {
	Logger        *zap.Logger
	Db            *sqlx.DB
	FileStore     IFileStore
	FileOwnerInfo IFileOwnerRepo
	UserRepo      IUserRepo
	AuthTokenRepo IAuthTokenRepo
}
