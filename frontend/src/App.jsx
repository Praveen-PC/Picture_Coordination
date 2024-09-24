import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const App = () => {
  const canvasRef = useRef(null);
  const [rectangles, setRectangles] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [selectedRectIndex, setSelectedRectIndex] = useState(null);
  const imgSrc = "/forest.jpg"; 

  useEffect(() => {
    getAreas();
    drawCanvas();
  }, [rectangles]); 

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawExistingRectangles(ctx);
    };
  };

  const getAreas = () => {
    axios
      .get("http://localhost:5000/api/areas")
      .then(function (response) {
        console.log(response.data);
        const areaCoordinates = {
          x: response.data[0][0],
          y: response.data[0][1],
          width: response.data[1][0],
          height: response.data[1][1],
        };
        drawCanvasWithCurrentRect(newRectangle);
        setRectangles([...rectangles]);
      })
      .catch(function (error) {
        console.log(error);
      })
      
  };

  const drawExistingRectangles = (ctx) => {
    rectangles.forEach((rect, index) => {
      ctx.strokeStyle = selectedRectIndex === index ? "blue" : "red";
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    });
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedIndex = rectangles.findIndex(
      (r) => x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
    );

    if (clickedIndex !== -1) {
      setSelectedRectIndex(clickedIndex);
      setStartPoint(null);
    } else {
      setStartPoint({ x, y });
      setIsDrawing(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRectangle = {
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(startPoint.x - x),
      height: Math.abs(startPoint.y - y),
    };

    drawCanvasWithCurrentRect(newRectangle);
  };

  const handleMouseUp = (e) => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newRectangle = {
        x: Math.min(startPoint.x, x),
        y: Math.min(startPoint.y, y),
        width: Math.abs(startPoint.x - x),
        height: Math.abs(startPoint.y - y),
      };

      setRectangles([...rectangles, newRectangle]);
      setIsDrawing(false);
    }
  };

  const drawCanvasWithCurrentRect = (currentRect) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawExistingRectangles(ctx);
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.strokeRect(
        currentRect.x,
        currentRect.y,
        currentRect.width,
        currentRect.height
      );
    };
  };

  const handleDelete = () => {
    if (selectedRectIndex !== null) {
      const updatedRectangles = rectangles.filter(
        (_, index) => index !== selectedRectIndex
      );
      setRectangles(updatedRectangles);
      setSelectedRectIndex(null);
    }
  };

  const handleUpdate = (x, y, width, height) => {
    if (selectedRectIndex !== null) {
      const updatedRectangles = [...rectangles];
      updatedRectangles[selectedRectIndex] = { x, y, width, height };
      setRectangles(updatedRectangles);
    }
  };

  const handleSubmit = async () => {
    const formattedShapes = rectangles.map((rect, index) => ({
      [`box${index + 1}`]: [
        [rect.x, rect.y],
        [rect.width, rect.height],
        // [rect.x + rect.width, rect.y + rect.height],
      ],
    }));

    try {
      await axios.post(`http://localhost:5000/api/areas`, formattedShapes);
      alert("Data sent to backend!");
    } catch (error) {
      console.error(error);
      alert("Error sending data");
    }
  };

  return (
    <>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid fw-bold">
          <a class="navbar-brand" href="#">
            Image Marking
          </a>
        </div>
      </nav>

      <div className="container mt-5">
        <div className="row">
          <div className="col">
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              style={{ border: "1px solid black" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            />
            <div className="mt-3">
              <button onClick={handleDelete} className="btn btn-danger me-2">
                Delete Selected
              </button>
              <button onClick={handleSubmit} className="btn btn-success">
                Submit
              </button>
            </div>
          </div>

          <div className="col">
            {selectedRectIndex !== null && (
              <div className="card p-3">
                <h2 className="text-center">Edit Rectangle</h2>
                <hr />
                <div className="mb-3">
                  <label for="exampleInputEmail1" class="form-label">
                    X-Coordinates :
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={rectangles[selectedRectIndex].x}
                    onChange={(e) =>
                      handleUpdate(
                        Number(e.target.value),
                        rectangles[selectedRectIndex].y,
                        rectangles[selectedRectIndex].width,
                        rectangles[selectedRectIndex].height
                      )
                    }
                    placeholder="X Coordinate"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Y-Coordinates :
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={rectangles[selectedRectIndex].y}
                    onChange={(e) =>
                      handleUpdate(
                        rectangles[selectedRectIndex].x,
                        Number(e.target.value),
                        rectangles[selectedRectIndex].width,
                        rectangles[selectedRectIndex].height
                      )
                    }
                    placeholder="Y Coordinate"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Width :
                  </label>
                  <input
                    type="number"
                    className="form-control "
                    value={rectangles[selectedRectIndex].width}
                    onChange={(e) =>
                      handleUpdate(
                        rectangles[selectedRectIndex].x,
                        rectangles[selectedRectIndex].y,
                        Number(e.target.value),
                        rectangles[selectedRectIndex].height
                      )
                    }
                    placeholder="Width"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="" className="form-label">
                    Height :
                  </label>
                  <input
                    type="number"
                    className="form-control mt-2 "
                    value={rectangles[selectedRectIndex].height}
                    onChange={(e) =>
                      handleUpdate(
                        rectangles[selectedRectIndex].x,
                        rectangles[selectedRectIndex].y,
                        rectangles[selectedRectIndex].width,
                        Number(e.target.value)
                      )
                    }
                    placeholder="Height"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
