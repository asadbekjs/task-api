const express = require("express");
const app = express();
app.use(express.json());

let tasks = [{ id: 1, title: "Sut olish", done: false }];
let nextId = 2;
const error = (code, message) => ({ error: { code, message } });
const findTask = (id) => tasks.find((t) => t.id === Number(id));

app.get("/api/tasks", (req, res) => {
  const { done, page = 1, limit = 10 } = req.query;
  let result = tasks;
  if (done !== undefined) {
    result = result.filter((t) => String(t.done) === done);
  }
  const p = Number(page);
  const l = Number(limit);
  const start = (p - 1) * l;

  res.json({
    data: result.slice(start, start + l),
    page: p,
    limit: l,
    total: result.length,
  });
});

app.get("/api/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task)
    return res.status(404).json(error("NOT_FOUND", "Vazifa topilmadi"));
  res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== "string" || !title.trim()) {
    return res
      .status(400)
      .json(error("VALIDATION_ERROR", "title bo'sh bo'lmasligi kerak"));
  }
  const task = { id: nextId++, title: title.trim(), done: false };
  tasks.push(task);
  res.status(201).location(`/api/tasks/${task.id}`).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task)
    return res.status(404).json(error("NOT_FOUND", "Vazifa topilmadi"));
  const { title, done } = req.body || {};
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json(error("VALIDATION_ERROR", "title yaroqsiz"));
    }
    task.title = title.trim();
  }
  if (done !== undefined) {
    if (typeof done !== "boolean") {
      return res
        .status(400)
        .json(error("VALIDATION_ERROR", "done true yoki false bo'lishi kerak"));
    }
    task.done = done;
  }
  res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const task = findTask(req.params.id);
  if (!task)
    return res.status(404).json(error("NOT_FOUND", "Vazifa topilmadi"));
  tasks = tasks.filter((t) => t.id !== task.id);
  res.status(204).end();
});

app.listen(3000, () => console.log("Server: http://localhost:3000"));
