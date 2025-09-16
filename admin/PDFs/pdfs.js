const uploadPdfForm = document.getElementById("uploadPdfForm");
const pdfsList = document.getElementById("pdfsList");

// Handle upload form submission
uploadPdfForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadPdfForm);
  try {
    const res = await fetch("/api/admin/pdfs", {
      method: "POST",
      body: formData,
      credentials: "include", // keep if you use cookie auth
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || "PDF uploaded successfully!");
      uploadPdfForm.reset();
      // loadPdfs(); // refresh list after upload
    } else {
      alert(data.error || "Failed to upload PDF");
    }
  } catch (err) {
    console.error("Error uploading PDF:", err);
    alert("Server error. Try again later.");
  }
});
// Fetch & display uploaded PDFs
async function loadPdfs() {
  try {
    const res = await fetch("/api/admin/pdfs", { credentials: "include" });
    const data = await res.json();
    pdfsList.innerHTML = "";
    if (!data || data.length === 0) {
      pdfsList.innerHTML = "<p>No PDFs uploaded yet.</p>";
      return;
    }
    // Build table
    let table = `
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>View</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
    `;
    data.forEach((pdf) => {
      table += `
        <tr>
          <td>${pdf.title}</td>
          <td>${pdf.description || ""}</td>
          <td><a href="/uploads/pdfs/${pdf.file_path}" target="_blank">View PDF</a></td>
          <td><button class="delete-pdf" data-id="${pdf.id}"><i class="fas fa-trash"></i> Delete</button></td>
        </tr>
      `;
    });
    table += `</tbody></table>`;
    pdfsList.innerHTML = table;
    // Attach delete events
    document.querySelectorAll(".delete-pdf").forEach((btn) => {
      btn.addEventListener("click", handleDeletePdf);
    });
  } catch (err) {
    console.error("Error fetching PDFs:", err);
    pdfsList.innerHTML = "<p>Server error while loading PDFs.</p>";
  }
}

// Delete PDF
async function handleDeletePdf(e) {
  const id = e.target.dataset.id;
  if (!confirm("Are you sure you want to delete this PDF?")) return;

  try {
    const res = await fetch(`/api/admin/pdfs/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    const data = await res.json();

    if (res.ok) {
      alert("PDF deleted!");
      loadPdfs(); // refresh
    } else {
      alert("Delete failed: " + (data.error || "Unknown error"));
    }
  } catch (err) {
    console.error("Error deleting PDF:", err);
  }
}
// Initial load
loadPdfs();