        const timezoneSelect = document.getElementById("timezone-select");
        const timezonesContainer = document.getElementById("timezones");
        const statusIndicator = document.getElementById("status-indicator");

        const clocksToUpdate = [];
        let timeOffset = 0;

        const allTimezones = Intl.supportedValuesOf("timeZone");
        allTimezones.forEach(tz => {
            const option = document.createElement("option");
            option.value = tz;
            option.textContent = tz;
            timezoneSelect.appendChild(option);
        });

        async function syncNetworkTime() {
            const apis = [               "https://timeapi.io/api/Time/current/zone?timeZone=UTC"
            ];

            for (const url of apis) {
                try {
                    const res = await fetch(url);
                    if (!res.ok) continue;
                    const data = await res.json();
                    const networkTime = new Date(data.utc_datetime || data.dateTime).getTime();
                    timeOffset = networkTime - Date.now();
                    statusIndicator.className = "status-dot status-sync";
                    return;
                } catch (e) {
                    continue;
                }
            }
            statusIndicator.className = "status-dot status-local";
            statusIndicator.textContent = "● 端末時間";
        }

        function addTimezone() {
            const tz = timezoneSelect.value;
            const uniqueId = "tz_" + Math.random().toString(36).substr(2, 9);

            const container = document.createElement("div");
            container.className = "timezone";
            container.id = uniqueId;

            container.innerHTML = `
                <div class="label">${tz}</div>
                <div class="date" id="${uniqueId}-date">----/--/--</div>
                <div class="time" id="${uniqueId}-time">00:00:00</div>
                <button class="remove-button">×</button>
            `;

            container.querySelector(".remove-button").addEventListener("click", () => {
                const idx = clocksToUpdate.findIndex(obj => obj.id === uniqueId);
                if (idx !== -1) clocksToUpdate.splice(idx, 1);
                container.remove();
            });

            timezonesContainer.appendChild(container);
            clocksToUpdate.push({ id: uniqueId, tz: tz });
            updateClocks();
        }

        function updateClocks() {
            const now = new Date(Date.now() + timeOffset);

            clocksToUpdate.forEach(clock => {
                const timeEl = document.getElementById(clock.id + "-time");
                const dateEl = document.getElementById(clock.id + "-date");

                if (timeEl && dateEl) {
                    timeEl.textContent = now.toLocaleTimeString("ja-JP", {
                        timeZone: clock.tz,
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                    });

                    dateEl.textContent = now.toLocaleDateString("ja-JP", {
                        timeZone: clock.tz,
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        weekday: "short"
                    });
                }
            });
        }

        window.addEventListener("DOMContentLoaded", async () => {
            timezoneSelect.value = "Asia/Tokyo";
            await syncNetworkTime();
            addTimezone();
            setInterval(updateClocks, 1000);
        });

        document.getElementById("add-button").addEventListener("click", addTimezone);