package main

import (
	"advmw"
	"bytes"
	"encoding/json"
	"fmt"
	"kmisc"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod/lib/launcher"
	"github.com/go-rod/rod/lib/proto"
	"go.uber.org/zap"
)

const masterPassword = "5a3b24a1-af5d-45b0-ac9a-767fa595a81f"
const discordWebhookUrl = "https://discord.com/api/webhooks/1025400099427340318/ClNbnFUc6DDzCCC6ds2EDYU-bwwdHdKE1wBy9wAg6ah8ugdbUEfX4MssWhWFGpyfr1O7"
const port = 23542
const timeout = 15 * time.Second

type Service struct {
	Logger      *zap.Logger
	Password    string
	Page        *rod.Page
	PageMutex   *sync.Mutex
	PageTimeout time.Duration
}

func main() {
	l := launcher.New().Headless(true).MustLaunch()
	page := rod.New().ControlURL(l).MustConnect().MustPage()

	r := chi.NewRouter()
	srv := Service{
		Logger:      kmisc.MustNewLogger(),
		Password:    masterPassword,
		Page:        page,
		PageMutex:   &sync.Mutex{},
		PageTimeout: timeout,
	}

	stack := advmw.NewStack[Service]()
	stack.Layer(passwordHeader(masterPassword))
	stack.Layer(autoErrorReporting(discordWebhookUrl))
	stack.Layer(advmw.Logger[Service](srv.Logger))
	stack.Layer(advmw.ErrorHandler[Service])
	stack.Layer(advmw.RequestId[Service])
	stack.Layer(advmw.InjectService(&srv))

	wrap := stack.Wrap

	r.Get("/", func(w http.ResponseWriter, r *http.Request) { fmt.Fprint(w, "wasmk3 von marcel") })
	r.Get("/on", wrap(on))
	r.Get("/off", wrap(off))

	fmt.Println("server started")
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), r)
	if err != nil {
		panic(err)
	}
}

func passwordHeader(password string) advmw.AdvMiddleware[Service] {
	return func(next advmw.AdvHandler[Service]) advmw.AdvHandler[Service] {
		return func(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
			pass := r.Header.Get("password")
			if pass != password {
				return advmw.NewUnauthorizedError(fmt.Errorf("wrong password. got '%s' expected '%s'", pass, password))
			}
			return next(w, r, srv)
		}
	}
}

func autoErrorReporting(url string) advmw.AdvMiddleware[Service] {
	type Message struct {
		Content string `json:"content"`
	}

	return func(next advmw.AdvHandler[Service]) advmw.AdvHandler[Service] {
		return func(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
			sErr := next(w, r, srv)
			if sErr != nil {
				go func() {
					msg := Message{
						Content: fmt.Sprintf("<@254957933379452929> %s", sErr.FullError().Error()),
					}
					jsonMsg, _ := json.Marshal(msg)
					msgReader := bytes.NewReader(jsonMsg)
					_, err := http.Post(url, "application/json", msgReader)
					if err != nil {
						srv.Logger.Warn("failed sending webhook message", zap.Error(err))
					}
				}()
			}
			return sErr
		}
	}
}

func on(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	logger := srv.Logger.With(
		zap.String("requestid", advmw.GetRequestId(r.Context())),
		zap.Bool("status", true),
	)

	var err error
	for i := 0; i < 3; i++ {
		if err != nil {
			logger.Info("failed, retrying", zap.Error(err))
		}
		err = toggle(true, srv, logger)
		if err == nil {
			break
		}

	}

	if err != nil {
		return advmw.NewFullError(err.Error(), 500)
	}

	return nil
}

func off(w http.ResponseWriter, r *http.Request, srv *Service) advmw.AppError {
	logger := srv.Logger.With(
		zap.String("requestid", advmw.GetRequestId(r.Context())),
		zap.Bool("status", false),
	)

	var err error
	for i := 0; i < 3; i++ {
		if err != nil {
			logger.Info("failed, retrying", zap.Error(err))
		}
		err = toggle(false, srv, logger)
		if err == nil {
			break
		}
	}

	if err != nil {
		return advmw.NewFullError(err.Error(), 500)
	}
	return nil
}

func toggle(status bool, srv *Service, l *zap.Logger) error {
	srv.PageMutex.Lock()
	defer srv.PageMutex.Unlock()

	defer l.Sync()

	// Timeout for page
	page := srv.Page.Timeout(srv.PageTimeout)

	// There is no reliable way to wait for EVERYTHING to load, instead we just wait and pray
	// Please trust me on this. I spent wayyy to many hours on what should have been a relativly simple task
	wait := func(mills time.Duration) {
		page.WaitRequestIdle(mills*time.Millisecond, nil, nil)()
	}

	// Navigate
	l.Info("navigating to interface")
	err := page.Navigate("http://192.168.2.1")
	if err != nil {
		return fmt.Errorf("error navigating to router interface: %w", err)
	}
	wait(1000)

	// Enter password
	l.Info("searching password")
	el, err := page.Element("#router_password")
	if err != nil {
		return fmt.Errorf("error navigating to router interface: %w", err)
	}
	l.Info("entering password")
	err = el.Input("92682001")
	if err != nil {
		return fmt.Errorf("error entering password: %w", err)
	}

	// Click login button
	l.Info("searching login button")
	el, err = page.Element("#loginbutton")
	if err != nil {
		return fmt.Errorf("error finding login button: %w", err)
	}
	l.Info("clicking login button")
	err = el.Click(proto.InputMouseButtonLeft, 1)
	if err != nil {
		return fmt.Errorf("error clicking login button: %w", err)
	}
	wait(1000)

	// Toggle status
	l.Info("toggling 2.4GHz")
	_, err = page.Eval(fmt.Sprintf("() => setWLANConnectionActive(%s)", strconv.FormatBool(status)))
	if err != nil {
		return fmt.Errorf("error toggling 2.4GHz status: %w", err)
	}
	wait(3000)

	l.Info("toggling 5GHz")
	_, err = page.Eval(fmt.Sprintf("() => setWLAN5GHzConnectionActive(%s)", strconv.FormatBool(status)))
	if err != nil {
		return fmt.Errorf("error toggling 5GHz status %w", err)
	}
	wait(3000)

	defer page.Navigate("") // I think we need to leave the page to actually toggle the status

	l.Info("finished")
	return nil
}
