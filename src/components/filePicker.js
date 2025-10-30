export class FilePicker {
  constructor(onFileSelected) {
    this.input = document.createElement("input");
    this.input.type = "file";
    this.input.accept = "application/json";
    this.input.style.display = "none";
    this.input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) onFileSelected(file);
      e.target.value = "";
    });
    document.body.appendChild(this.input);
  }
  open() {
    this.input.click();
  }
}
