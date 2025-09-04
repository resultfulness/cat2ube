package main

import (
	"bufio"
	"cat2ube/events"
	"log"
	"os/exec"
	"strings"
	"sync"
)

type ProcessManager struct {
	broker *events.EventBroker
}

func (pm *ProcessManager) ProcessDownload(dl *Download) {
	pm.broker.Publish(events.EventTypeRunning, dl.ID, "0%")

	cmd := exec.Command(
		"./yt-dlp",
		"-o",
		"videos/%(title)s[%(id)s].%(ext)s",
		"--newline",
		"--progress",
		"--progress-template",
		"%(progress._percent_str)s",
		"--progress-delta",
		"1",
		dl.Url,
	)

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		log.Printf("cmd not started: %s\n", err.Error())
		pm.broker.Publish(events.EventTypeFailed, dl.ID, err.Error())
	}

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			line := scanner.Text()
			line = strings.TrimSpace(line)
			if line[0] == '[' {
				pm.broker.Publish(events.EventTypeInfo, dl.ID, line)
			} else {
				pm.broker.Publish(events.EventTypeRunning, dl.ID, line)
			}
		}
	}()
	go func() {
		defer wg.Done()
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			line := scanner.Text()
			pm.broker.Publish(events.EventTypeFailed, dl.ID, line)
		}
	}()
	wg.Wait()
	if err := cmd.Wait(); err != nil {
		log.Printf("cmd failed: %v", err)
		pm.broker.Publish(events.EventTypeFailed, dl.ID, err.Error())
		return
	}

	pm.broker.Publish(events.EventTypeCompleted, dl.ID)
}
