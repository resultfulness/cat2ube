package main

import (
	"cat2ube/events"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type App struct {
	broker  *events.EventBroker
	queue   *DownloadQueue
	manager *ProcessManager
}

func (a *App) handleIndex(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "index.html")
}
func (a *App) handleSync(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Cache-Control")

	sub := a.broker.Subscribe()
	defer a.broker.Unsubscribe(sub)
	log.Println("client connected")

	j, _ := json.Marshal(a.queue)
	fmt.Fprintf(w, "event: cattube:initial\ndata: %s\n\n", string(j))
	if f, ok := w.(http.Flusher); ok {
		f.Flush()
	}

	ctx := r.Context()
	for {
		select {
		case <-ctx.Done():
			log.Println("client disconnected")
			return
		case event := <-sub:
			fmt.Fprint(w, event.ToSSEString())
			if f, ok := w.(http.Flusher); ok {
				f.Flush()
			}
		}
	}
}
func (a *App) handleDownload(w http.ResponseWriter, r *http.Request) {
	url := r.FormValue("url")
	if url == "" {
		http.Error(w, "url is required", http.StatusBadRequest)
		return
	}

	dl, err := a.queue.Enqueue(url)
	if err != nil {
		log.Printf("error: %s\n", err)
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	a.broker.Publish(events.EventTypeQueued, dl.ID, dl.Url)
	go func() {
		a.manager.GetMetadata(dl)
	}()
}

func main() {
	binaryPath := os.Getenv("YTDLP_PATH")
	outputPath := os.Getenv("OUTPUT_PATH")
	if len(binaryPath) < 1 && len(outputPath) < 1 {
		panic("path env vars required")
	}

	if stat, err := os.Stat(binaryPath); err != nil {
		panic("binary error, probably doesn't exist")
	} else {
		if stat.Mode()&0111 == 0 {
			panic("binary not executable")
		}
	}
	if stat, err := os.Stat(outputPath); err != nil {
		panic("output path error, probably doesn't exist")
	} else {
		if !stat.Mode().IsDir() {
			panic("output path not a directory")
		}
	}

	var broker = events.NewBroker()
	var queue = NewDownloadQueue()
	var manager = ProcessManager{&broker, outputPath, binaryPath}
	app := App{&broker, &queue, &manager}
	app.queue.StartBackgroundProcess(app.manager.ProcessDownload)

	http.HandleFunc("/", app.handleIndex)
	http.HandleFunc("/sync", app.handleSync)
	http.HandleFunc("/download", app.handleDownload)
	http.Handle("/static/", http.StripPrefix("/static", http.FileServer(http.Dir("./static"))))

	log.Println("server started")
	http.ListenAndServe(":8080", nil)
}
