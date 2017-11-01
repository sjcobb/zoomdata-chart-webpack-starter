/* global controller */
import './--chartname--.css';

// create chart container
const chartContainer = document.createElement('div');
chartContainer.style.width = '100%';
chartContainer.style.height = '100%';
chartContainer.classList.add('chart-container');
controller.element.appendChild(chartContainer);

// called when new data is received from server
controller.update = data => {};

// called when the chart widget is resized
controller.resize = (newWidth, newHeight) => {};
