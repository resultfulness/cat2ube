const events = {
    init(data) {
        for (const dl of data.downloadList) {
            app.queue.add(dl.id, dl.url);
            app.queue.setMetadata(dl.id, dl.title, dl.thumbnailSrc);
        }
    },
    onqueued(data) {
        app.queue.add(data.id, data.message);
    },
    onrunning(data) {
        app.progress.set(data.message);
    },
    oncompleted(data) {
        app.queue.del(data.id);
    },
    onfailed(data) {
        app.progress.reset();
        app.info.insertError(data.message);
        app.queue.del(data.id);
    },
    oninfo(data) {
        app.info.insert(data.message);
    },
    onmetadata(data) {
        let [thumbnailSrc, ...title] = data.message.split(" ")
        title = title.join(" ")
        app.queue.setMetadata(data.id, title, thumbnailSrc);
    }
};

export default events;
