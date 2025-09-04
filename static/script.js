import events from "./events.js";

const eventSource = new EventSource("/sync");
eventSource.onerror = function(event) {
    console.error(event);
};

eventSource.addEventListener("cattube:initial", events.init);
eventSource.addEventListener("cattube:queued", events.onqueued);
eventSource.addEventListener("cattube:running", events.onrunning);
eventSource.addEventListener("cattube:completed", events.oncompleted);
eventSource.addEventListener("cattube:failed", events.onfailed);
eventSource.addEventListener("cattube:info", events.oninfo);

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".download-form").addEventListener("submit", e => {
        e.preventDefault();

        const url = e.target.querySelector(".download-form__input").value;
        const d = new FormData();
        d.append("url", url)

        fetch("/download", {
            method: "POST",
            body: d
        }).catch(e => console.error(e));
    });
})

window.addEventListener("beforeunload", (e) => {
    eventSource.close()
})

