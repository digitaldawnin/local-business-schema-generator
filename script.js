const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const hoursContainer = document.getElementById("hours");

days.forEach(day => {
  const row = document.createElement("div");
  row.className = "hours-row";
  row.innerHTML = `<span>${day}</span><input type="time" data-day="${day}" data-part="open" aria-label="${day} opening time"><input type="time" data-day="${day}" data-part="close" aria-label="${day} closing time">`;
  hoursContainer.appendChild(row);
});

const $ = id => document.getElementById(id);
const val = id => $(id).value.trim();
const add = (obj, key, value) => { if (value) obj[key] = value; };

function generateSchema() {
  if (!val("name")) {
    $("status").textContent = "Business name is required.";
    $("name").focus();
    return null;
  }

  const schema = { "@context": "https://schema.org", "@type": val("type") || "LocalBusiness", "name": val("name") };
  add(schema, "url", val("url"));
  add(schema, "telephone", val("phone"));
  add(schema, "email", val("email"));
  add(schema, "description", val("description"));
  add(schema, "priceRange", val("priceRange"));
  add(schema, "logo", val("logo"));
  add(schema, "image", val("image"));

  const address = {};
  add(address, "@type", "PostalAddress");
  add(address, "streetAddress", val("streetAddress"));
  add(address, "addressLocality", val("city"));
  add(address, "addressRegion", val("state"));
  add(address, "postalCode", val("postalCode"));
  add(address, "addressCountry", val("country"));
  if (Object.keys(address).length > 1) schema.address = address;

  const lat = val("latitude"), lng = val("longitude");
  if (lat && lng && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
    schema.geo = { "@type": "GeoCoordinates", latitude: Number(lat), longitude: Number(lng) };
  }

  const schemaDays = {
    Monday: "https://schema.org/Monday", Tuesday: "https://schema.org/Tuesday", Wednesday: "https://schema.org/Wednesday",
    Thursday: "https://schema.org/Thursday", Friday: "https://schema.org/Friday", Saturday: "https://schema.org/Saturday", Sunday: "https://schema.org/Sunday"
  };
  const openingHoursSpecification = [];
  document.querySelectorAll(".hours-row").forEach(row => {
    const open = row.querySelector("[data-part='open']").value;
    const close = row.querySelector("[data-part='close']").value;
    const day = row.querySelector("[data-part='open']").dataset.day;
    if (open && close) openingHoursSpecification.push({ "@type": "OpeningHoursSpecification", "dayOfWeek": schemaDays[day], "opens": open, "closes": close });
  });
  if (openingHoursSpecification.length) schema.openingHoursSpecification = openingHoursSpecification;

  const sameAs = ["facebook","instagram","linkedin"].map(val).filter(Boolean);
  if (sameAs.length) schema.sameAs = sameAs;
  return schema;
}

function render() {
  const schema = generateSchema();
  if (!schema) return;
  $("output").textContent = JSON.stringify(schema, null, 2);
  $("status").textContent = "Schema generated locally.";
}

$("schemaForm").addEventListener("submit", e => { e.preventDefault(); render(); });

$("copyBtn").addEventListener("click", async () => {
  const schema = generateSchema();
  if (!schema) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    $("status").textContent = "Copied to clipboard.";
  } catch { $("status").textContent = "Copy failed. Select the code manually."; }
});

$("downloadBtn").addEventListener("click", () => {
  const schema = generateSchema();
  if (!schema) return;
  const blob = new Blob([JSON.stringify(schema, null, 2)], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "local-business-schema.json"; a.click();
  URL.revokeObjectURL(url);
  $("status").textContent = "JSON file downloaded.";
});

$("resetBtn").addEventListener("click", () => {
  $("schemaForm").reset(); $("country").value = "IN";
  $("output").textContent = '{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness"\n}';
  $("status").textContent = "";
});

$("sampleBtn").addEventListener("click", () => {
  $("name").value = "Digital Dawn";
  $("type").value = "ProfessionalService";
  $("url").value = "https://www.digitaldawn.in/";
  $("phone").value = "+91 98765 43210";
  $("email").value = "hello@digitaldawn.in";
  $("description").value = "Digital services company based in Indore, Madhya Pradesh, helping local businesses build and improve their online presence.";
  $("city").value = "Indore"; $("state").value = "Madhya Pradesh"; $("postalCode").value = "452001"; $("country").value = "IN"; $("priceRange").value = "$$";
  render();
});
