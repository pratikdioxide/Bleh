class SmartStreetLightSystem {
    constructor() {
        this.lights = [];
        this.autoMode = false;
        this.masterBrightness = 80;
        this.motionDetection = true;
        this.lightSensor = true;
        this.init();
    }

    init() {
        this.generateLights();
        this.setupEventListeners();
        this.startSimulation();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateEnvironmentalData(), 5000);
        setInterval(() => this.autoLightControl(), 3000);
    }

    generateLights() {
        const container = document.getElementById('lights-container');
        for (let i = 1; i <= 20; i++) {
            const light = {
                id: i,
                status: Math.random() > 0.4 ? 'on' : 'off',
                brightness: Math.floor(Math.random() * 100) + 1,
                energyConsumption: Math.random() * 50 + 10,
                lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                motionDetected: false,
                needsMaintenance: Math.random() > 0.9
            };
            
            this.lights.push(light);
            
            const lightElement = this.createLightElement(light);
            container.appendChild(lightElement);
        }
        this.updateStats();
    }

    createLightElement(light) {
        const lightDiv = document.createElement('div');
        lightDiv.className = `street-light ${light.status}`;
        if (light.needsMaintenance) {
            lightDiv.className += ' maintenance';
        }
        lightDiv.id = `light-${light.id}`;
        
        lightDiv.innerHTML = `
            <i class="fas fa-lightbulb light-icon"></i>
            <div class="light-id">Light ${light.id}</div>
            <div class="light-status">${light.status.toUpperCase()}</div>
        `;
        
        lightDiv.addEventListener('click', () => this.toggleLight(light.id));
        return lightDiv;
    }

    setupEventListeners() {
        // System control buttons
        document.getElementById('all-on-btn').addEventListener('click', () => this.allLightsOn());
        document.getElementById('all-off-btn').addEventListener('click', () => this.allLightsOff());
        document.getElementById('auto-mode-btn').addEventListener('click', () => this.toggleAutoMode());
        
        // Settings
        const brightnessSlider = document.getElementById('brightness-slider');
        brightnessSlider.addEventListener('input', (e) => this.setMasterBrightness(e.target.value));
        
        document.getElementById('motion-detection').addEventListener('change', (e) => {
            this.motionDetection = e.target.checked;
        });
        
        document.getElementById('light-sensor').addEventListener('change', (e) => {
            this.lightSensor = e.target.checked;
        });
    }

    toggleLight(lightId) {
        const light = this.lights.find(l => l.id === lightId);
        if (light && !light.needsMaintenance) {
            light.status = light.status === 'on' ? 'off' : 'on';
            this.updateLightElement(light);
            this.updateStats();
            this.showNotification(`Light ${lightId} turned ${light.status.toUpperCase()}`);
        } else if (light && light.needsMaintenance) {
            this.showNotification(`Light ${lightId} needs maintenance!`, 'warning');
        }
    }

    allLightsOn() {
        this.lights.forEach(light => {
            if (!light.needsMaintenance) {
                light.status = 'on';
                this.updateLightElement(light);
            }
        });
        this.updateStats();
        this.showNotification('All functional lights turned ON');
    }

    allLightsOff() {
        this.lights.forEach(light => {
            if (!light.needsMaintenance) {
                light.status = 'off';
                this.updateLightElement(light);
            }
        });
        this.updateStats();
        this.showNotification('All lights turned OFF');
    }

    toggleAutoMode() {
        this.autoMode = !this.autoMode;
        const btn = document.getElementById('auto-mode-btn');
        if (this.autoMode) {
            btn.style.background = 'linear-gradient(135deg, #dc3545, #e55564)';
            btn.innerHTML = '<i class="fas fa-stop"></i> Stop Auto';
            this.showNotification('Auto mode ENABLED - Lights will respond to sensors');
        } else {
            btn.style.background = 'linear-gradient(135deg, #28a745, #34ce57)';
            btn.innerHTML = '<i class="fas fa-robot"></i> Auto Mode';
            this.showNotification('Auto mode DISABLED');
        }
    }

    setMasterBrightness(value) {
        this.masterBrightness = parseInt(value);
        document.getElementById('brightness-value').textContent = `${value}%`;
        
        // Apply brightness to all lights
        this.lights.forEach(light => {
            if (light.status === 'on') {
                light.brightness = this.masterBrightness;
            }
        });
        
        this.showNotification(`Master brightness set to ${value}%`);
    }

    autoLightControl() {
        if (!this.autoMode) return;

        const currentHour = new Date().getHours();
        const isDark = currentHour >= 18 || currentHour <= 6;
        
        this.lights.forEach(light => {
            if (light.needsMaintenance) return;

            // Simulate motion detection
            if (this.motionDetection && Math.random() > 0.8) {
                light.motionDetected = true;
                setTimeout(() => light.motionDetected = false, 5000);
            }

            // Auto control based on conditions
            if (this.lightSensor && isDark) {
                light.status = 'on';
            } else if (this.lightSensor && !isDark) {
                light.status = 'off';
            }

            // Motion-triggered lighting
            if (this.motionDetection && light.motionDetected) {
                light.status = 'on';
                light.brightness = 100;
            }

            this.updateLightElement(light);
        });
        
        this.updateStats();
    }

    updateLightElement(light) {
        const element = document.getElementById(`light-${light.id}`);
        if (element) {
            element.className = `street-light ${light.status}`;
            if (light.needsMaintenance) {
                element.className += ' maintenance';
            }
            
            const statusElement = element.querySelector('.light-status');
            if (light.needsMaintenance) {
                statusElement.textContent = 'MAINTENANCE';
            } else if (light.motionDetected) {
                statusElement.textContent = 'MOTION';
            } else {
                statusElement.textContent = light.status.toUpperCase();
            }
        }
    }

    updateStats() {
        const totalLights = this.lights.length;
        const activeLights = this.lights.filter(l => l.status === 'on').length;
        const totalEnergy = this.lights
            .filter(l => l.status === 'on')
            .reduce((sum, l) => sum + (l.energyConsumption * l.brightness / 100), 0);
        const energySaved = (totalLights * 50) - totalEnergy; // Assuming 50W max per light

        document.getElementById('total-lights').textContent = totalLights;
        document.getElementById('active-lights').textContent = activeLights;
        document.getElementById('energy-saved').textContent = `${energySaved.toFixed(1)} kWh`;
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('current-time').textContent = timeString;
    }

    updateEnvironmentalData() {
        // Simulate environmental data updates
        const temperatures = [18, 19, 20, 21, 22, 23, 24, 25];
        const visibilityConditions = ['Excellent', 'Good', 'Fair', 'Poor'];
        
        const temp = temperatures[Math.floor(Math.random() * temperatures.length)];
        const visibility = visibilityConditions[Math.floor(Math.random() * visibilityConditions.length)];
        
        document.getElementById('temperature').textContent = `${temp}°C`;
        document.getElementById('visibility').textContent = visibility;
    }

    startSimulation() {
        // Simulate random events
        setInterval(() => {
            if (Math.random() > 0.95) {
                const randomLight = this.lights[Math.floor(Math.random() * this.lights.length)];
                if (!randomLight.needsMaintenance && Math.random() > 0.5) {
                    randomLight.status = randomLight.status === 'on' ? 'off' : 'on';
                    this.updateLightElement(randomLight);
                    this.updateStats();
                }
            }
        }, 10000);

        // Simulate maintenance alerts
        setInterval(() => {
            if (Math.random() > 0.98) {
                const functionalLights = this.lights.filter(l => !l.needsMaintenance);
                if (functionalLights.length > 0) {
                    const randomLight = functionalLights[Math.floor(Math.random() * functionalLights.length)];
                    randomLight.needsMaintenance = true;
                    this.updateLightElement(randomLight);
                    this.showNotification(`Light ${randomLight.id} requires maintenance!`, 'warning');
                }
            }
        }, 30000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'warning' ? '#ffc107' : '#28a745'};
            color: ${type === 'warning' ? '#333' : 'white'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.smartLightSystem = new SmartStreetLightSystem();
});

// Add some additional interactive features
document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
        window.smartLightSystem.toggleAutoMode();
    } else if (e.key === '1') {
        window.smartLightSystem.allLightsOn();
    } else if (e.key === '0') {
        window.smartLightSystem.allLightsOff();
    }
});

// Add touch support for mobile devices
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, false);
}