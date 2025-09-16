document.addEventListener("DOMContentLoaded", () => {
  const membersList = document.getElementById("membersList");
  const editModal = document.getElementById("editMemberModal");
  const editForm = document.getElementById("editMemberForm");
  const editMessage = document.getElementById("editMemberMessage");
  const closeEditBtn = document.getElementById("closeEditMember");

  // Fetch members
  async function fetchMembers() {
    try {
      const res = await fetch("http://127.0.0.1:3000/api/members");
      if (!res.ok) throw new Error("Failed to fetch members");
      const members = await res.json();
      displayMembers(members);
    } catch (err) {
      console.error(err);
      membersList.innerHTML = `<tr><td colspan="9">Failed to load members.</td></tr>`;
    }
  }

  function displayMembers(members) {
    if (!members.length) {
      membersList.innerHTML = `<tr><td colspan="9">No members found.</td></tr>`;
      return;
    }

    membersList.innerHTML = members.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.email}</td>
        <td>${m.number}</td>
        <td>${m.category}</td>
        <td>${m.date_established || '-'}</td>
        <td>${m.organization_size || '-'}</td>
        <td>${m.years_activity || '-'}</td>
        <td>${m.submission_date ? new Date(m.submission_date).toLocaleDateString() : '-'}</td>
        <td>
          <button class="action-btn edit-btn" data-id="${m.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="action-btn delete-btn" data-id="${m.id}"><i class="fas fa-trash"></i> Delete</button>
        </td>
      </tr>
    `).join("");

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openEditModal(btn.dataset.id));
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteMember(btn.dataset.id));
    });
  }

  async function openEditModal(id) {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/members`);
      const members = await res.json();
      const member = members.find(m => m.id == id);
      if (!member) return alert("Member not found");

      // Fill form
      editForm.id.value = member.id;
      editForm.name.value = member.name;
      editForm.email.value = member.email;
      editForm.number.value = member.number;
      editForm.category.value = member.category;
      editForm.date_established.value = member.date_established || "";
      editForm.organization_size.value = member.organization_size || "";
      editForm.years_activity.value = member.years_activity || "";

      editMessage.innerText = "";
      editModal.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      alert("Failed to load member data");
    }
  }

  // Close modal
  closeEditBtn.addEventListener("click", () => editModal.classList.add("hidden"));

  // Submit edit form
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = editForm.id.value;
    const data = {
      name: editForm.name.value,
      email: editForm.email.value,
      number: editForm.number.value,
      category: editForm.category.value,
      date_established: editForm.date_established.value,
      organization_size: editForm.organization_size.value,
      years_activity: editForm.years_activity.value
    };

    try {
      const res = await fetch(`http://127.0.0.1:3000/api/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed to update member");

      editMessage.innerText = "Member updated successfully!";
      fetchMembers();
      setTimeout(() => editModal.classList.add("hidden"), 1000);
    } catch (err) {
      console.error(err);
      editMessage.innerText = "Failed to update member";
    }
  });

  async function deleteMember(id) {
    if (!confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      fetchMembers();
    } catch (err) {
      console.error(err);
      alert("Failed to delete member.");
    }
  }

  fetchMembers();
});
