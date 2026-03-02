function renderContactsTemplate(initials, colorClass, name, isYou){
    return `
        <div class="contact-left">
          <div class="contact-circle ${colorClass}">${initials}</div>
          <span>${name}</span>
        </div>
        <input type="checkbox" value="${name}" ${isYou ? "checked" : ""}>
        `;
}

function addSubtaskItemTemplate(value){
     return `
    <input type="text" value="${value}" disabled>

    <div class="subtask-actions">
      <button type="button" class="edit-btn">
        <!-- Edit Icon -->
        <svg class="edit-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24">
          <mask id="a" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha">
            <path fill="#2a3647" d="M0 0h24v24H0z"/>
          </mask>
          <g mask="url(#a)">
            <path fill="#2a3647" d="M5 19h1.4l8.625-8.625-1.4-1.4L5 17.6zM19.3 8.925l-4.25-4.2 1.4-1.4a1.92 1.92 0 0 1 1.413-.575q.837 0 1.412.575l1.4 1.4q.574.575.6 1.388a1.8 1.8 0 0 1-.55 1.387zM17.85 10.4 7.25 21H3v-4.25l10.6-10.6z"/>
          </g>
        </svg>

        <!-- Save Icon -->
        <svg class="save-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <mask id="a" width="24" height="24" x="0" y="0" maskUnits="userSpaceOnUse" style="mask-type:alpha">
            <path fill="#d9d9d9" d="M0 0h24v24H0z"/>
          </mask>
          <g mask="url(#a)">
            <path fill="#2a3647" d="m9.55 15.15 8.476-8.475q.3-.3.712-.3.413 0 .713.3t.3.713q0 .411-.3.712l-9.2 9.2q-.3.3-.7.3a.96.96 0 0 1-.7-.3L4.55 13a.93.93 0 0 1-.288-.713 1.02 1.02 0 0 1 .313-.712q.3-.3.712-.3.413 0 .713.3z"/>
          </g>
        </svg>
      </button>

      <span class="divider"></span>

      <button type="button" class="delete-btn">
        <svg class="subtask-icons" xmlns="http://www.w3.org/2000/svg" width="16" height="17" fill="none" viewBox="0 0 17 18">
          <path fill="#2a3647" d="M3.145 18q-.825 0-1.413-.587A1.93 1.93 0 0 1 1.145 16V3a.97.97 0 0 1-.713-.288A.97.97 0 0 1 .145 2q0-.424.287-.712A.97.97 0 0 1 1.145 1h4q0-.424.287-.712A.97.97 0 0 1 6.145 0h4q.424 0 .712.288.288.287.288.712h4q.424 0 .712.288.288.287.288.712 0 .424-.288.712a.97.97 0 0 1-.712.288v13q0 .824-.588 1.413a1.93 1.93 0 0 1-1.412.587zm0-15v13h10V3zm2 10q0 .424.287.713.288.287.713.287.424 0 .712-.287A.97.97 0 0 0 7.145 13V6a.97.97 0 0 0-.288-.713A.97.97 0 0 0 6.145 5a.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713zm4 0q0 .424.287.713.288.287.713.287.424 0 .712-.287a.97.97 0 0 0 .288-.713V6a.97.97 0 0 0-.288-.713.97.97 0 0 0-.712-.287.97.97 0 0 0-.713.287.97.97 0 0 0-.287.713z"/>
        </svg>
      </button>
    </div>
  `;
}
