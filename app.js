import express from "express";
import http from "http";
import path from "path";
import {Server as SocketIOServer} from "socket.io";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);