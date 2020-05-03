import os
import time

from flask import Flask, render_template
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

messages = {}
channels = []


@app.route("/")
def index():
    return render_template('index.html', channels=channels)

@socketio.on("new_channel")
def new_channel(channel):
    if channel in channels:
        emit("error", "Name already exist")
    else:
        channels.append(channel)
        messages[channel] = []
        join_room(channel)
        info = {"channel": channel, "messages": messages[channel]}
        emit("join_channel", info)

@socketio.on("join_channel")
def join_channel(channel):
    join_room(channel)
    info = {"channel": channel, "messages": messages[channel]}
    emit("join_channel", info)
    
@socketio.on("channel_messages")
def channel_messages(json):
    timestamp = time.ctime(time.time())
    data = {"user": json["user"], "message": json["message"], "timestamp": timestamp}
    messages[json["channel"]].append(data)
    if len(messages[json["channel"]]) > 100:
        messages[json["channel"]].pop(0)
    emit("channel_messages", data, broadcast=True)

@socketio.on("change_channel")
def change_channel(old_channel, new_channel):
    leave_room(old_channel)
    join_room(new_channel)
    info = {"channel": new_channel, "messages": messages[new_channel]}
    emit("join_channel", info)

