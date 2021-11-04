const divCar = `
  <div class="col-md-4">
    <div class="card mb-4">
      <img src="__src__" class="card-img-top" alt="Card image cap" height="200">
      <div class="card-body">
        <h5 class="card-title">TOP __top__</h5>
        <p class="card-text">__title__</p>
        <p class="card-text">__description__</p>
        <a href="__link__" class="btn btn-primary">Go somewhere</a>
      </div>
    </div>
  </div>
`;

const htmlToElement = (html) => {
  const template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
};

const fetchApiDone = (json) => {
  const divList = document.getElementById("list");
  json.forEach((car, i) => {
    const newDivCar = divCar
      .replace("__link__", car.link)
      .replace("__src__", car.img)
      .replace("__top__", i + 1)
      .replace("__title__", car.name)
      .replace("__description__", car.description);
    divList.appendChild(htmlToElement(newDivCar));
  });
};

const fetchLocal = (url) => {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      resolve(new Response(xhr.response, { status: xhr.status }));
    };
    xhr.onerror = function () {
      reject(new TypeError("Local request failed"));
    };
    xhr.open("GET", url);
    xhr.responseType = "arraybuffer";
    xhr.send(null);
  });
};

document.addEventListener("DOMContentLoaded", () => {
  const cars = JSON.parse(window.localStorage.getItem("cars"))
  if (!cars) {
    fetch("api/cars.json").then((response) =>
      response.json().then((data) => {
        window.localStorage.setItem("cars", JSON.stringify(data))
        fetchApiDone(data)
      }));    
  }
  else{
    fetchApiDone(cars)
  }
  
});

const addCar = () => {
  const car = {
    "name": document.getElementById("car-model").value,
    "description": document.getElementById("car-description").value,
    "img": document.getElementById("car-image").value,
    "link": document.getElementById("car-link").value,
  }
  fetchApiDone([car])
  const cars = JSON.parse(window.localStorage.getItem("cars"))
  const newCars = [...cars, car]
  window.localStorage.setItem("cars", JSON.stringify(newCars));
}

const fetchApiCars = () => {
  fetchLocal("api/cars.json").then((response) =>
    response.json().then(fetchApiDone)
  );
};

if ("cordova" in window) {
  document.addEventListener("deviceready", fetchApiCars);
}