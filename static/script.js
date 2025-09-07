import events from "./events.js";

window.app = {};
window.$ = s => document.querySelector(s);

document.addEventListener("DOMContentLoaded", () => {
    app.events = events;
    app.downloadForm = $(".download-form");
    app.downloadFormInput = $(".download-form__input");
    app.downloadFormClear = $(".download-form__clear");
    app.queue = {
        element: $(".queue-list"),
        children: new Map(),
        add(id, text) {
            const queueElement = document.createElement("queue-element");
            this.children.set(id, queueElement);
            this.element.append(queueElement);
            queueElement.setUrlText(text)
        },
        del(id) {
            const c = this.children.get(id)
            if (c) c.remove();
            this.children.delete(id);
        },
        setText(id, text) {
            const c = this.children.get(id)
            if (c) c.textContent = text;
        },
        setMetadata(id, title, thumbnailSrc) {
            const queueElement = this.children.get(id);
            if (!queueElement) return;
            queueElement.setTitleText(title)
            queueElement.setImgSrc(thumbnailSrc)
        }
    };
    app.progress = {
        element: $(".progress-bar-fill"),
        set(p) {
            this.element.style.width = parseInt(p.replace("%", "")) + "%";
        },
        reset() {
            this.element.style.width = "0%";
        }
    };
    app.info = {
        element: $(".info-content"),
        insert(text) {
            const d = document.createElement("div");
            d.textContent = text;
            this.element.insertBefore(d, this.element.firstChild);
            return d;
        },
        insertError(text) {
            const d = this.insert("[error] " + text);
            d.style.color = "tomato";
        }
    }
    app.eventSource = new EventSource("/sync");
    app.eventSource.onerror = function(event) {
        console.error(event);
    };
    app.eventSource.listen = function(event, onevent) {
        this.addEventListener(
            `cattube:${event}`,
            (e => { onevent(JSON.parse(e.data)) })
        );
    }

    app.eventSource.listen("initial", app.events.init);
    app.eventSource.listen("queued", app.events.onqueued);
    app.eventSource.listen("running", app.events.onrunning);
    app.eventSource.listen("completed", app.events.oncompleted);
    app.eventSource.listen("failed", app.events.onfailed);
    app.eventSource.listen("info", app.events.oninfo);
    app.eventSource.listen("metadata", app.events.onmetadata);

    app.downloadForm.addEventListener("submit", async e => {
        e.preventDefault();

        if (!app.downloadFormInput.value) {
            app.downloadFormInput.value = await navigator.clipboard.readText()
        }
        const url = app.downloadFormInput.value;

        const d = new FormData();
        d.append("url", url);

        try {
            await fetch("/download", {
                method: "POST",
                body: d
            });
        } catch (e) {
            console.error(e);
        }
    });
    app.downloadFormClear.addEventListener("click", e => {
        app.downloadFormInput.value = "";
    })
});

window.addEventListener("beforeunload", (e) => {
    if (app.eventSource) {
        app.eventSource.close();
    }
});
