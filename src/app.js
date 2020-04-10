const express = require("express");
const cors = require("cors");

// import express from 'express';
// import cors from 'cors';
// import { uuid, isUuid } from 'uuidv4';

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

function logRequests(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
  console.log(response.statusCode);
}

function validateProjectId(request, response, next) {
  const { id } = request.params;
  if (!isUuid(id)) {
    return response.status(400).json({ error: 'Invalida Id.' });
  }
  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateProjectId);

const repositories = [];

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs} = request.body;
  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };
  repositories.push(repository);
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;
  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' });
  }
  const repositoryLikes = repositories[repositoryIndex].likes
  console.log(repositoryLikes)
  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositoryLikes
  };
  repositories[repositoryIndex] = repository;
  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' });
  }
  repositories.splice(repositoryIndex, 1);
  return response.status(204).json();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex((repository) => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({ error: 'Repository not found.' });
  }
  repositories[repositoryIndex].likes = repositories[repositoryIndex].likes + 1
  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
