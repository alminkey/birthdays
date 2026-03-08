
import streamlit as st
from fpdf import FPDF
import datetime

st.set_page_config(page_title="AI Invoice Generator", page_icon="🧾", layout="wide")

st.markdown("<h1 style='text-align: center; color: #1f77b4;'>🧾 AI Invoice Generator</h1>", unsafe_allow_html=True)
st.markdown("---")

with st.sidebar:
    st.header("🤖 O ovoj aplikaciji")
    st.markdown("""
    **AI Invoice Generator**

    Autonomno kreirano od strane Agent Zero.

    **Funkcionalnosti:**
    - 📝 Generiranje računa
    - 🧠 AI opisi usluga
    - 💾 PDF izvoz

    Vrijeme: < 1 minuta
    """)

def generate_ai_description(service, hours):
    descs = {
        "AI Automatizacija": f"Izrada AI automatizacije za optimizaciju poslovnih procesa.",
        "Web Razvoj": f"Razvoj web aplikacije sa modernim tehnologijama.",
        "Konsultacije": f"Strateško konsultiranje o AI implementaciji.",
        "Održavanje": f"Redovno održavanje i podrška za AI rješenje.",
        "default": f"Usluga: {service} ({hours} sati)."
    }
    return descs.get(service, descs["default"])

def create_pdf(data):
    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", 'B', 20)
    pdf.cell(0, 10, "INVOICE", ln=True, align='R')
    pdf.set_font("Arial", '', 10)
    pdf.cell(0, 5, f"#: {data['invoice_num']}", ln=True, align='R')
    pdf.cell(0, 5, f"Date: {data['date']}", ln=True, align='R')

    pdf.set_xy(10, 50)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 5, "FROM:", ln=True)
    pdf.set_font("Arial", '', 10)
    pdf.cell(0, 5, data["from_name"], ln=True)
    pdf.cell(0, 5, data["from_addr"], ln=True)

    pdf.set_xy(10, 80)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(0, 5, "TO:", ln=True)
    pdf.set_font("Arial", '', 10)
    pdf.cell(0, 5, data["to_name"], ln=True)
    pdf.cell(0, 5, data["to_addr"], ln=True)

    pdf.set_xy(10, 110)
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(120, 7, "Description", border=1)
    pdf.cell(30, 7, "Hours", border=1)
    pdf.cell(40, 7, "Amount", border=1, ln=True)

    pdf.set_font("Arial", '', 10)
    total = 0
    for item in data["items"]:
        pdf.cell(120, 7, item["desc"], border=1)
        pdf.cell(30, 7, str(item["hours"]), border=1)
        pdf.cell(40, 7, f"EUR {item['amount']:.2f}", border=1, ln=True)
        total += item["amount"]

    pdf.set_font("Arial", 'B', 12)
    pdf.cell(120, 10, "", border=0)
    pdf.cell(30, 10, "TOTAL:", border=0)
    pdf.cell(40, 10, f"EUR {total:.2f}", border=1, ln=True)

    return pdf

st.header("📝 Podaci za račun")

from_name = st.text_input("Ime tvoje firme", "AI Automation doo")
from_addr = st.text_input("Adresa", "Ulica 123, 10000 Grad")
to_name = st.text_input("Ime klijenta")
to_addr = st.text_input("Adresa klijenta")

invoice_num = st.text_input("Broj računa", "INV-001")
invoice_date = st.date_input("Datum", datetime.date.today())

st.subheader("🛠️ Usluge")
if "items" not in st.session_state:
    st.session_state.items = []

service = st.selectbox("Tip usluge", ["AI Automatizacija", "Web Razvoj", "Konsultacije", "Održavanje"])
hours = st.number_input("Sati", min_value=1, max_value=200, value=10)
hourly_rate = st.number_input("Satnica", min_value=10, max_value=1000, value=100)

use_ai = st.checkbox("🧠 Koristi AI opis", value=True)

if st.button("➕ Dodaj uslugu"):
    if use_ai:
        desc = generate_ai_description(service, hours)
    else:
        desc = f"{service} - {hours} sati"

    amount = hours * hourly_rate
    st.session_state.items.append({"desc": desc, "hours": hours, "amount": amount})
    st.success(f"Dodano: {desc} - EUR {amount:.2f}")

if st.session_state.items:
    st.subheader("📦 Dodane usluge")
    total = sum(item["amount"] for item in st.session_state.items)

    for i, item in enumerate(st.session_state.items, 1):
        st.write(f"{i}. {item['desc']} - {item['hours']}h - EUR {item['amount']:.2f}")

    st.markdown(f"### 💰 UKUPNO: **EUR {total:.2f}**")

    if st.button("🧾 GENERIRAJ PDF"):
        invoice_data = {
            "invoice_num": invoice_num,
            "date": invoice_date.strftime("%d/%m/%Y"),
            "from_name": from_name,
            "from_addr": from_addr,
            "to_name": to_name,
            "to_addr": to_addr,
            "items": st.session_state.items
        }

        pdf = create_pdf(invoice_data)
        filename = f"invoice_{invoice_num}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = f"/a0/usr/workdir/{filename}"
        pdf.output(filepath)

        st.success(f"✅ Račun generiran: {filename}")

        with open(filepath, "rb") as f:
            st.download_button("📥 Preuzmi PDF", f.read(), filename, "application/pdf")

st.markdown("---")
st.markdown("<center><i>Kreirano autonomno od strane Agent Zero</i></center>", unsafe_allow_html=True)
