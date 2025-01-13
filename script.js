const grid = document.getElementById('grid'),
  coordinatesDisplay = document.getElementById('coordinatesDisplay'),
  coordinatesTable = document.getElementById('coordinatesTable'),
  billiardTable = document.getElementById('billiardTable'),
  fileInput = document.getElementById('fileInput'),
  titleInput = document.getElementById('title'),
  descriptionInput = document.getElementById('description');

let coordinates = [],
  availableNumbers = [...Array(16).keys()],
  billiardColors = [
    '#000000', '#FFFF00', '#0000FF', '#FF0000', '#FF8C00', '#00008B',
    '#8B4513', '#8B0000', '#008000', '#FFD700', '#9400D3', '#FF00FF',
    '#00CED1', '#FFD700', '#FF4500', '#696969'
  ],
  originalColor = '#006400', // Couleur verte originale
  whiteColor = '#FFFFFF', // Couleur blanche
  altColor = '#66a266', // Couleur alternée
  isWhite = false;

const createGrid = () => {
  for (let y = 8; y >= 0; y--) {
    for (let x = 0; x < 17; x++) {
      const cell = document.createElement('div');
      cell.dataset.x = x;
      cell.dataset.y = y;

      // Ajouter la classe "peripheral" aux cellules périphériques
      if (x === 0 || x === 16 || y === 0 || y === 8) {
        cell.classList.add('peripheral');
      }

      cell.addEventListener('click', () => toggleCoordinate(x, y, cell));
      grid.appendChild(cell);
    }
  }
};

const toggleCoordinate = (x, y, cell) => {
  const index = coordinates.findIndex(coord => coord.x === x && coord.y === y);
  coordinatesDisplay.textContent = `Coordonnées sélectionnées : X=${x}, Y=${y}`;

  if (index !== -1) {
    const removed = coordinates.splice(index, 1)[0];
    cell.classList.remove('active');
    cell.style.backgroundColor = (x + y) % 2 === 0 ? (isWhite ? whiteColor : altColor) : (isWhite ? whiteColor : originalColor); // Utiliser la couleur appropriée
    cell.textContent = '';
    availableNumbers.push(removed.number);
  } else {
    if (coordinates.length >= 16) return alert('Vous ne pouvez sélectionner que 16 coordonnées.');
    const coordinate = { x, y, number: availableNumbers.shift() };
    coordinates.push(coordinate);
    cell.classList.add('active');
    cell.style.backgroundColor = billiardColors[coordinate.number];
    cell.textContent = coordinate.number;
  }
  availableNumbers.sort((a, b) => a - b);
  renderCoordinates();
};

const renderCoordinates = () => {
  coordinatesTable.innerHTML = coordinates
    .slice()
    .sort((a, b) => a.number - b.number) // Trier par numéro en ordre croissant
    .map(coord => `
      <tr>
        <td>
          <div class="circle-cell" style="background-color: ${billiardColors[coord.number]}; color: #fff; font-size: 14px; width: 24px; height: 24px;">
            ${coord.number}
          </div>
        </td>
        <td>${coord.x}</td> <!-- Affichage de X -->
        <td>${coord.y}</td> <!-- Affichage de Y -->
        <td><button onclick="deleteCoordinate(${coord.number})">Supprimer</button></td>
      </tr>
    `).join('');
};

const deleteCoordinate = index => {
  const coord = coordinates.find(coord => coord.number === index);
  if (coord) {
    const cell = document.querySelector(`.grid div[data-x='${coord.x}'][data-y='${coord.y}']`);
    cell.classList.remove('active');
    cell.style.backgroundColor = (coord.x + coord.y) % 2 === 0 ? (isWhite ? whiteColor : altColor) : (isWhite ? whiteColor : originalColor); // Utiliser la couleur appropriée
    cell.textContent = '';
    availableNumbers.push(coord.number);
    coordinates = coordinates.filter(c => c.number !== coord.number);
    availableNumbers.sort((a, b) => a - b);
    renderCoordinates();
    renderGrid();
  }
};

const renderGrid = () => {
  document.querySelectorAll('.grid div').forEach(cell => {
    cell.classList.remove('active');
    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    cell.style.backgroundColor = (x + y) % 2 === 0 ? (isWhite ? whiteColor : altColor) : (isWhite ? whiteColor : originalColor); // Utiliser la couleur appropriée
    cell.textContent = '';
    cell.style.display = 'flex'; // Show all cells
  });

  coordinates.forEach(coord => {
    const cell = document.querySelector(`.grid div[data-x='${coord.x}'][data-y='${coord.y}']`);
    if (cell) {
      cell.classList.add('active');
      cell.style.backgroundColor = billiardColors[coord.number];
      cell.textContent = coord.number;
      cell.style.display = 'flex';
    }
  });
};



const parseCSV = csv => {
  clearSelections();
  const [titleLine, descLine, , ...lines] = csv.split('\n');
  titleInput.value = titleLine.split(',')[1].trim();
  descriptionInput.value = descLine.split(',')[1].trim();
  coordinates = lines.map(line => {
    const [number, x, y] = line.split(',').map(item => item.trim());
    return { number: parseInt(number, 10), x: parseInt(x, 10), y: parseInt(y, 10) };
  }).filter(coord => !isNaN(coord.number));

  availableNumbers = Array.from({ length: 16 }, (_, i) => i).filter(i => !coordinates.some(coord => coord.number === i));
  renderCoordinates();
  renderGrid();
};

const loadFromFile = () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = event => {
      parseCSV(event.target.result);
    };
    reader.readAsText(file);
  } else {
    alert("Veuillez sélectionner un fichier CSV.");
  }
};

const clearSelections = () => {
  coordinates = [];
  availableNumbers = Array.from({ length: 16 }, (_, i) => i);
  titleInput.value = '';
  descriptionInput.value = '';
  renderGrid();
  renderCoordinates();
};

const coordinatesToCSV = () => {
  const rows = [
    ['Title', titleInput.value],
    ['Description', descriptionInput.value],
    ['Number', 'X', 'Y'],
    ...coordinates.map(coord => [coord.number, coord.x, coord.y])
  ];
  return rows.map(row => row.join(',')).join('\n');
};

const saveToFile = () => {
  const csv = coordinatesToCSV();
  const blob = new Blob([csv], { type: 'text/csv' }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');

  a.style.display = 'none';
  a.href = url;
  a.download = `${titleInput.value}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const toggleColors = () => {
  isWhite = !isWhite; // Toggle the color state
  billiardTable.style.backgroundColor = isWhite ? whiteColor : originalColor;

  document.querySelectorAll('.grid div').forEach(cell => {
    const x = parseInt(cell.dataset.x, 10);
    const y = parseInt(cell.dataset.y, 10);
    const hasActiveClass = cell.classList.contains('active');

    if (isWhite) {
      if (hasActiveClass) {
        cell.style.backgroundColor = billiardColors[parseInt(cell.textContent)];
        cell.style.border = '1px solid #ccc';
        cell.style.display = 'flex';
      } else {
        cell.style.backgroundColor = whiteColor;
        cell.style.border = '1px solid #fff'; // White border for non-active cells
        cell.style.display = 'flex';
      }
    } else {
      cell.style.display = 'flex';
      if (hasActiveClass) {
        cell.style.backgroundColor = billiardColors[parseInt(cell.textContent)]; // Restore billiard color for active cells
        cell.style.border = '1px solid #ccc';
      } else {
        cell.style.backgroundColor = (x + y) % 2 === 0 ? altColor : originalColor;
        cell.style.border = '1px solid #ccc';
      }
    }
  });
};



// Initialisation
createGrid();
