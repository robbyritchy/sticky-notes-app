function createNoteElement(id, content) {
  const element = document.createElement("textarea");
  element.classList.add("note");
  element.value = content;
  element.placeholder = "Empty Sticky Note";

  // Restore saved position/size if available
  const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
  const noteData = notes.find(n => n.id === id);
  if (noteData) {
    element.style.top = noteData.top || "50px";
    element.style.left = noteData.left || "50px";
    element.style.width = noteData.width || "200px";
    element.style.height = noteData.height || "200px";
  }

  // Content update
  element.addEventListener("change", () => {
    updateNote(id, element.value, element);
  });

  // Double click delete
  element.addEventListener("dblclick", () => {
    const doDelete = confirm("Are you sure you want to delete this sticky note?");
    if (doDelete) deleteNote(id, element);
  });

  // Dragging
  let isDragging = false, offsetX, offsetY;
  element.addEventListener("mousedown", (e) => {
    if (e.target === element) { // only drag from body, not resize corner
      isDragging = true;
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      element.style.left = (e.pageX - offsetX) + "px";
      element.style.top = (e.pageY - offsetY) + "px";
    }
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      updateNote(id, element.value, element); // save new position
    }
  });

  return element;
}
