document.addEventListener('DOMContentLoaded', () => {

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

  socket.on("connect", () => {
    if (!localStorage.getItem('name')) {
      localStorage.setItem('name', prompt("What is your name?"));
      document.querySelector('h1').innerHTML = (`Welcome ${localStorage.getItem('name')}`);
    } else {
      document.querySelector('h1').innerHTML = (`Welcome ${localStorage.getItem('name')}`);
    }

    if (!localStorage.getItem("channel")) {
      document.querySelector("#messages").style.dispaly = "none";
    } else {
      socket.emit("join_channel", localStorage.getItem("channel"));
    }
  });

  document.querySelector('#create').addEventListener('click', () => {
    let channel = document.querySelector('#create_channel').value;
    socket.emit('new_channel', channel);
    document.querySelector('#create_channel').value = "";
    location.reload(true);
  });

  
  socket.on("join_channel", info => {
    localStorage.setItem("channel", info["channel"]);
    document.querySelector("#chat").innerHTML = "";
    document.querySelector("#channel_name").innerHTML = (`You are in ${info["channel"]}`);
    document.querySelector("#messages").style.dispaly = "block";
    for (let i in info["messages"]) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${info["messages"][i].user}</strong><div><span>${info["messages"][i].message}</span></div> <samll>${info["messages"][i].timestamp}</small>`;
      li.className = "eachChat";
      document.querySelector("#chat").append(li);
    }
  });

  document.querySelector("#send").addEventListener('click', () => {
    let message = document.querySelector("#new_chat").value;
    let user = localStorage.getItem("name");
    const channel = localStorage.getItem("channel");
    socket.emit("channel_messages", {
      "message": message,
      "user": user,
      "channel": channel
    });
    document.querySelector("#new_chat").value = "";
  });

  socket.on("channel_messages", data => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${data.user}</strong> <div><span>${data.message}</span></div><small>${data.timestamp}</small>`
    document.querySelector("#chat").append(li);
  });

  document.querySelectorAll(".all_channel").forEach(li => {
    li.onclick = () => {
      socket.emit("change_channel", localStorage.getItem("channel"), li.dataset.channel);
    };
  });

  socket.on("error", message => {
    alert(message);
  });

});
