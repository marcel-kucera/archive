package main

import (
	"advmw"
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
)

type AuthContextKeyType int

const AuthContextKey AuthContextKeyType = iota

const AuthCookieKey string = "authtoken"

func AuthGuard(required bool) advmw.AdvMiddleware[Service] {
	return func(next advmw.AdvHandler[Service]) advmw.AdvHandler[Service] {
		return func(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
			var errUser User // should something error out we will return empty user

			// Extract function to allow for just one check for error and if auth is required
			extract := func() (User, advmw.AppError) {

				tokenString, err := r.Cookie(AuthCookieKey)
				if err != nil {
					return errUser, advmw.NewUnauthorizedError(fmt.Errorf("no token cookie: %s", err))
				}
				token, err := uuid.Parse(tokenString.Value)
				if err != nil {
					return errUser, advmw.NewFormError(errors.New("malformed token value"))
				}

				userId, sErr := srv.AuthTokenRepo.Get(token)
				if sErr != nil {
					return errUser, sErr
				}
				return srv.UserRepo.GetUserById(userId)
			}

			user, sErr := extract()
			newR := r
			if sErr != nil && required {
				return sErr
			} else if sErr == nil {
				newR = r.Clone(context.WithValue(r.Context(), AuthContextKey, user))

			}

			return next(w, newR, srv)
		}
	}

}

func UserFromContext(ctx context.Context) (User, advmw.AppError) {
	var user User
	userVal := ctx.Value(AuthContextKey)
	if userVal == nil {
		return user, advmw.NewUnauthorizedError(errors.New("no user in context"))
	}
	user, ok := userVal.(User)
	if !ok {
		return user, advmw.NewUndefinedError(errors.New("user type assertion from context failed"))
	}
	return user, nil
}
