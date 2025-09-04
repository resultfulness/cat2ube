const events = {
    init(e) {
        const queueList = document.querySelector(".queue-list");
        const data = JSON.parse(e.data);

        if (!data.downloadList) {
            return;
        }

        for (const dl of data.downloadList) {
            const li = document.createElement("li");
            li.textContent = dl.url;
            queueList.append(li);
        }
    },
    onqueued(e) {
        const queueList = document.querySelector(".queue-list");
        const data = JSON.parse(e.data);

        if (!data.id && !data.message) {
            return;
        }

        const li = document.createElement("li");
        li.classList.add(`queued-${data.id}`)
        li.textContent = data.message;
        queueList.append(li);
    },
    onrunning(e) {
        const progressBar = document.querySelector(".progress-bar-fill");
        const data = JSON.parse(e.data);
        if (!data.id && !data.message) {
            return;
        }
        progressBar.style.width = parseInt(data.message.replace("%", "")) + "%"
    },
    oncompleted(e) {
        const queueList = document.querySelector(".queue-list")
        const data = JSON.parse(e.data);
        if (!data.id) {
            return;
        }
        queueList.querySelector(`.queued-${data.id}`).remove();

    },
    onfailed(e) {
        const progressBar = document.querySelector(".progress-bar-fill");
        progressBar.style.width = "0%";
        const data = JSON.parse(e.data);
        if (data.message) {
            const infoContent = document.querySelector(".info-content");
            const d = document.createElement("div");
            d.textContent = "[error] " + data.message;
            d.style.color = "tomato";
            infoContent.insertBefore(d, infoContent.firstChild);
        }
        if (data.id) {
            const queueList = document.querySelector(".queue-list");
            queueList.querySelector(`.queued-${data.id}`).remove();
        }
    },
    oninfo(e) {
        const infoContent = document.querySelector(".info-content");
        const data = JSON.parse(e.data);
        if (!data.message) {
            return;
        }
        const d = document.createElement("div");
        d.textContent = data.message;
        infoContent.insertBefore(d, infoContent.firstChild);

        if (data.message.startsWith("[download] Destination: ")) {
            const m = /\[download\] Destination: videos\/(.*)(\[.*\].f.*\..*)/
            const name = data.message.match(m)[1];
            if (data.id) {
                const queueList = document.querySelector(".queue-list")
                queueList.querySelector(`.queued-${data.id}`).textContent = name;
            }
        }
    },
};

export default events;
