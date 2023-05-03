package main

import (
	"advmw"
	"database/sql"
	"errors"
	"fmt"
	"kmisc"
	"net/http"

	_ "embed"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

//go:embed db.sql
var DbSetupString string

func main() {
	db := sqlx.MustConnect("sqlite", "db.sqlite?_pragma=foreign_keys(1)")
	db.MustExec(DbSetupString)
	row := db.QueryRow("SELECT * FROM user WHERE id = ?", uuid.Nil)
	err := row.Scan()
	if errors.Is(err, sql.ErrNoRows) {
		_, err := db.Exec("INSERT INTO user (id,name,password,admin) VALUES (?,?,?,?)", uuid.Nil, "Anonymous", uuid.NewString(), false)
		if err != nil {
			panic(fmt.Errorf("failed setting up anonymous user: %w", err))
		}
	}

	srv := Service{
		Logger: kmisc.MustNewLogger(),
		FileStore: &FileStore{
			Dir: "uploads",
		},
		UserRepo:      &UserRepo{Db: db},
		AuthTokenRepo: &AuthTokenRepo{Db: db},
		FileOwnerInfo: &FileOwnerRepo{Db: db},
		Db:            db,
	}

	r := chi.NewRouter()
	r.Use(CorsMiddleware)

	stack := advmw.AdvStack[Service]{}
	stack.Layer(advmw.Logger[Service](srv.Logger))
	stack.Layer(advmw.ErrorHandler[Service])
	stack.Layer(advmw.RequestId[Service])
	stack.Layer(advmw.InjectService(&srv))
	wrap := stack.Wrap
	withAuth := func(reqired bool) *advmw.AdvStack[Service] {
		return stack.WithInner(AuthGuard(reqired))
	}

	r.Post("/upload", withAuth(false).Wrap(Upload))
	r.Get("/download", wrap(Download))
	r.Get("/info", wrap(FileInfo))

	r.Post("/register", wrap(Register))
	r.Post("/login", wrap(Login))
	r.Get("/userinfo", withAuth(true).Wrap(UserInfo))
	r.Get("/myfiles", withAuth(true).Wrap(MyFiles))

	http.ListenAndServe(":3000", r)
}

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173/")
		}
		next.ServeHTTP(w, r)
	})
}
