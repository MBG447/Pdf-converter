document.addEventListener("DOMContentLoaded", function () {
    // Highlight the active navigation link
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });

    // Initialize JPG to PDF Converter if the required elements exist
    if (document.getElementById('fileInput')) {
        initializeJpgToPdfConverter();
    }
});

function initializeJpgToPdfConverter() {
    const { jsPDF } = window.jspdf;

    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const conversionMethod = document.getElementById('conversionMethod');
    const convertBtn = document.getElementById('convertBtn');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const pdfPreview = document.getElementById('pdfPreview');
    const pdfFileName = document.getElementById('pdfFileName');
    const pdfFileSize = document.getElementById('pdfFileSize');
    const downloadLink = document.getElementById('downloadLink');

    let images = [];

    fileInput.addEventListener('change', function (event) {
        const files = event.target.files;
        images = [];
        uploadedFiles.innerHTML = '';

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();

            reader.onload = function (e) {
                const fileDiv = document.createElement('div');
                fileDiv.classList.add('uploaded-file');

                const img = document.createElement('img');
                img.src = 'https://cdn-icons-png.flaticon.com/512/136/136522.png';
                img.classList.add('preview-image');
                fileDiv.appendChild(img);

                const fileName = document.createElement('span');
                fileName.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
                fileDiv.appendChild(fileName);

                uploadedFiles.appendChild(fileDiv);

                images.push({
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                });
            };

            reader.readAsDataURL(file);
        }

        conversionMethod.style.display = 'block';
        convertBtn.style.display = 'block';
    });

    convertBtn.addEventListener('click', function () {
        if (images.length === 0) {
            alert('Please upload at least one image.');
            return;
        }

        loadingSpinner.style.display = 'block';
        convertBtn.style.display = 'none';

        const method = document.querySelector('input[name="method"]:checked').value;

        setTimeout(() => {
            if (method === 'separate') {
                images.forEach((image, index) => {
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    const width = pdf.internal.pageSize.getWidth();
                    const height = pdf.internal.pageSize.getHeight();

                    pdf.addImage(image.src, 'JPEG', 0, 0, width, height);
                    const pdfBlob = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfBlob);

                    pdfFileName.textContent = `${image.name.replace(/\.[^/.]+$/, '')}.pdf`;
                    pdfFileSize.textContent = `${(pdfBlob.size / 1024).toFixed(2)} KB`;
                    downloadLink.href = pdfUrl;
                    pdfPreview.style.display = 'block';
                });
            } else {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const width = pdf.internal.pageSize.getWidth();
                const height = pdf.internal.pageSize.getHeight();

                images.forEach((image, index) => {
                    if (index > 0) {
                        pdf.addPage();
                    }
                    pdf.addImage(image.src, 'JPEG', 0, 0, width, height);
                });

                const pdfBlob = pdf.output('blob');
                const pdfUrl = URL.createObjectURL(pdfBlob);

                pdfFileName.textContent = 'merged.pdf';
                pdfFileSize.textContent = `${(pdfBlob.size / 1024).toFixed(2)} KB`;
                downloadLink.href = pdfUrl;
                pdfPreview.style.display = 'block';
            }

            loadingSpinner.style.display = 'none';
        }, 1000);
    });

    function resetConverter() {
        fileInput.value = '';
        uploadedFiles.innerHTML = '';
        conversionMethod.style.display = 'none';
        convertBtn.style.display = 'none';
        pdfPreview.style.display = 'none';
        images = [];
    }
}