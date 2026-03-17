document.addEventListener('DOMContentLoaded', () => {
    const yearButtons = document.querySelectorAll('.love-y li div');
    const monthContainer = document.querySelector('.live-m');
    const modal = document.getElementById('love-modal');

    // 1. 연도 버튼 클릭 이벤트
    yearButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const year = btn.id.replace('y', ''); // "y2026" -> "2026"
            fetchYearData(year);
        });
    });

    // 2. JSON 데이터 가져오기
    async function fetchYearData(year) {
        try {
            const response = await fetch(`json/love${year}.json`);
            const data = await response.json();
            renderArchive(data);
        } catch (err) {
            console.error("데이터 로딩 실패:", err);
            alert("기록 파일을 찾을 수 없습니다.");
        }
    }

    function renderArchive(data) {
        monthContainer.innerHTML = ''; 
        monthContainer.style.display = 'block';

        data.forEach(mGroup => {
            const section = document.createElement('div');
            section.className = 'month-section';
            
            section.innerHTML = `
                <h2 class="month-title">${mGroup.month}월</h2>
                <div class="love-${mGroup.month} day-wrapper"></div>
            `;
            
            const wrapper = section.querySelector('.day-wrapper');

            mGroup.records.forEach(rec => {
                const card = document.createElement('div');
                card.className = 'day-card';
                
                // [수정 포인트] photo-text를 photo-frame 안으로 넣었습니다.
                card.innerHTML = `
                    <div class="photo-frame">
                        <img src="${rec.images[0]}">
                        <div class="photo-text">
                            <span class="card-date-title">${rec.title}</span>
                            <p>${rec.summary}</p>
                        </div>
                    </div>
                `;
                
                card.onclick = () => openModal(rec);
                wrapper.appendChild(card);
            });

            monthContainer.appendChild(section);
        });
    }

    // 4. 모달 열기
    function openModal(rec) {
        document.getElementById('modal-date').innerText = `${rec.fullDate} ${rec.title}`;
        document.getElementById('modal-text').innerText = rec.content;
        
        const photoRight = document.getElementById('modal-photos');
        photoRight.innerHTML = ''; // 초기화
        
        rec.images.forEach(imgSrc => {
            const img = document.createElement('img');
            img.src = imgSrc;
            photoRight.appendChild(img);
        });

        modal.style.display = 'block';
    }

    // 5. 모달 닫기
    document.querySelector('.close-btn').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if(e.target == modal) modal.style.display = 'none'; };
});