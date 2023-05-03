package main

import (
	"advmw"
	"database/sql"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

type User struct {
	Id    uuid.UUID `json:"id"`
	Name  string    `json:"name"`
	Admin bool      `json:"admin"`
}

type UserLogin struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

type UserAdd struct {
	Name     string `json:"name"`
	Password string `json:"password"`
	Admin    bool   `json:"admin"`
}

type IUserRepo interface {
	GetUserById(uuid.UUID) (User, advmw.AppError)
	GetUserByLogin(UserLogin) (User, advmw.AppError)
	GetUsers() ([]User, advmw.AppError)
	AddUser(UserAdd) (User, advmw.AppError)
	DeleteUser(uuid.UUID) advmw.AppError
}

type UserRepo struct {
	Db *sqlx.DB
}

func (r *UserRepo) GetUserById(id uuid.UUID) (User, advmw.AppError) {
	var user User
	err := r.Db.Get(&user, "SELECT id,name,admin FROM user WHERE id=?", id.String())
	if err == sql.ErrNoRows {
		return user, advmw.NewNotFoundError(err, "user")
	}
	if err != nil {
		return user, advmw.NewDbError(err)
	}
	return user, nil
}

func (r *UserRepo) GetUserByLogin(login UserLogin) (User, advmw.AppError) {
	var user User
	err := r.Db.Get(&user, "SELECT id,name,admin FROM user WHERE name=? AND password=?", login.Name, login.Password)
	if err == sql.ErrNoRows {
		return user, advmw.NewNotFoundError(err, "user")
	}
	if err != nil {
		return user, advmw.NewDbError(err)
	}
	return user, nil
}

func (r *UserRepo) GetUsers() ([]User, advmw.AppError) {
	var users []User
	err := r.Db.Select(&users, "SELECT id,name,admin FROM user")
	if err != nil {
		return users, advmw.NewDbError(err)
	}
	return users, nil
}

func (r *UserRepo) AddUser(newUser UserAdd) (User, advmw.AppError) {
	var user User
	err := r.Db.Get(&user, "INSERT INTO user (id,name,password,admin) VALUES (?,?,?,?) RETURNING id,name,admin",
		uuid.NewString(),
		newUser.Name,
		newUser.Password,
		newUser.Admin,
	)
	if err != nil {
		return user, advmw.NewDbError(err)
	}
	return user, nil
}

func (r *UserRepo) DeleteUser(id uuid.UUID) advmw.AppError {
	_, err := r.Db.Exec("DELETE FROM user WHERE id=?", id)
	if err != nil {
		return advmw.NewDbError(err)
	}
	return nil
}
