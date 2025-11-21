const fs = require("fs");
const path = require("path");

exports.dashboardPage = async function (req, res, upstreamManager, opts = {}) {
  const upstreams = upstreamManager.list();
  const viewPath = path.join(__dirname, "views", "index.html");
  let html = fs.readFileSync(viewPath, "utf8");
  const rows = upstreams
  .map(
    (u) => `
      <tr>
        <td data-label="Upstream">${u.url}</td>
        <td data-label="Priority">${u.priority || "-"}</td>
        <td data-label="Weight">${u.weight || "-"}</td>
        <td data-label="Status">
          <span class="badge ${u.healthy ? "badge-green" : "badge-red"}">
            ${u.healthy ? "Healthy" : "Unhealthy"}
          </span>
        </td>
      </tr>`
  )
  .join("");

  html = html.replace("{{upstreamRows}}", rows);
  res.setHeader("Content-Type", "text/html");
  res.send(html);
};
