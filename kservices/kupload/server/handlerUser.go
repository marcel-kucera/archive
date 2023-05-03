package main

import (
	"advmw"
	"encoding/json"
	"fmt"
	"net/http"
)

func Register(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	loginData := UserLogin{}
	err := json.NewDecoder(r.Body).Decode(&loginData)
	if err != nil {
		return advmw.NewFormError(err)
	}

	newUser := UserAdd{
		Name:     loginData.Name,
		Password: loginData.Password,
		Admin:    false,
	}
	_, sErr := srv.UserRepo.AddUser(newUser)
	if sErr != nil {
		return sErr
	}
	return nil
}

func Login(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	loginData := UserLogin{}
	err := json.NewDecoder(r.Body).Decode(&loginData)
	if err != nil {
		return advmw.NewFormError(err)
	}

	user, sErr := srv.UserRepo.GetUserByLogin(loginData)
	if sErr != nil {
		return sErr
	}

	token, sErr := srv.AuthTokenRepo.Generate(user.Id)
	if sErr != nil {
		return sErr
	}

	http.SetCookie(w, &http.Cookie{
		Name:  AuthCookieKey,
		Value: token.String(),
	})
	return nil
}

func UserInfo(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	user, sErr := UserFromContext(r.Context())
	if sErr != nil {
		return sErr
	}
	data, err := json.Marshal(user)
	if err != nil {
		return advmw.NewUndefinedError(err)
	}
	fmt.Fprint(w, string(data))
	return nil
}
