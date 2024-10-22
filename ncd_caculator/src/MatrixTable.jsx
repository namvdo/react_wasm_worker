import React from "react";

const MatrixTable = ({ ncdMatrix, labels }) => {
  return (
    <table style={{ borderCollapse: "collapse", margin: "20px auto", width: "80%", maxWidth: "600px", overflowX: "auto" }}>
      <thead>
        <tr>
          <th style={{ padding: "10px", border: "1px solid #ccc" }}>{ ncdMatrix.length + "x" + ncdMatrix.length}</th>
          {labels.map((label, index) => (
            <th key={index} style={{ padding: "10px", border: "1px solid #ccc" }}>
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ncdMatrix.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <th style={{ padding: "10px", border: "1px solid #ccc" }}>
              {labels[rowIndex]}
            </th>
            {row.map((value, colIndex) => (
              <td key={colIndex} style={{ padding: "10px", border: "1px solid #ccc" }}>
                {value.toFixed(4)} {/* Display value with 4 decimal places */}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MatrixTable;