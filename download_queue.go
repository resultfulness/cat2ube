package main

import (
	"errors"
	"log"
)

type Download struct {
	ID  int    `json:"id"`
	Url string `json:"url"`
}

type DownloadQueue struct {
	downloads    chan *Download
	DownloadList []Download `json:"downloadList"`
	current      *Download
	maxID        int
}

func NewDownloadQueue() DownloadQueue {
	return DownloadQueue{
		downloads: make(chan *Download, 10),
		DownloadList: make([]Download, 0, 10),
	}
}

func (dq *DownloadQueue) Enqueue(url string) (Download, error) {
	dq.maxID += 1
	dl := Download{dq.maxID, url}

	select {
	case dq.downloads <- &dl:
	default:
		return dl, errors.New("download queue full")
	}
	dq.DownloadList = append(dq.DownloadList, dl)
	return dl, nil
}

func (dq *DownloadQueue) StartBackgroundProcess(run func(*Download)) {
	go func() {
		for dl := range dq.downloads {
			dq.current = dl
			log.Printf("dequeued download, running: %s\n", dl.Url)
			run(dl)
			dq.DownloadList = dq.DownloadList[1:]
			log.Printf("ran download: %s\n", dl.Url)
		}
	}()
}
