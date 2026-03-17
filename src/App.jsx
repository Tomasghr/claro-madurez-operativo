import React from "react";
import { Routes, Route } from "react-router-dom";
import ModeloOperativo from "./ModeloOperativo";
import ControlOperativo from "./ControlOperativo";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ModeloOperativo />} />
      <Route path="/admin" element={<ControlOperativo />} />
    </Routes>
  );
}
