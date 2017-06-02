//   @todo

"use strict";

class main {
     constructor() {
          // main.loadServiceWorker();
          this.eventHandler = new EventHandler();
          this.prepApp();
     }

     static loadServiceWorker() {
          if ('serviceWorker' in navigator) {
               navigator.serviceWorker.register('/ServiceWorker.js');
          }
     }

     prepApp() {
          document.getElementById('list').style.display = 'none';
          document.getElementById('legacy').style.display = 'none';
          document.getElementById('entry').style.display = 'block';
          document.getElementById('entryButton').classList.add('success');
          this.eventHandler.handleEntryButton();
          this.eventHandler.handleListButton();
          this.eventHandler.handleLegacyButton();
          this.eventHandler.handleMaps();
          this.eventHandler.handleSubmit();
          this.eventHandler.countWorkOrders(0);
          this.eventHandler.newEntry();
          this.eventHandler.goForward();
          this.eventHandler.goBack();
          this.eventHandler.setButton(false);
          this.eventHandler.detectEdit();
          this.eventHandler.setDate();
          this.eventHandler.handleCompleted();
          FadeStuff.doFade('in', 'title');
     }
}

//----------------------------------------------------------------------------------------------------------------------

class EventHandler {
     constructor() {
          this.workList = [];
          this.counter = 0;
          this.backCount = 0;
          this.forwardCount = 0;
          this.recordCount = 0;
          this.populateForm();
     }

     populateForm() {
          document.getElementById('mainForm').reset();
          this.counter = 0;
          this.recordCount = 0;
          this.performAjax('XMLHttpRequest1', 0, (response) => {
               let tempList = JSON.parse(response);
               for (let i = 0; i < Object.keys(tempList).length; i++) {
                    delete tempList[i].maps;
                    this.workList.unshift(tempList[i]);
                    this.recordCount++;
                    this.putData();
                    this.countWorkOrders(this.recordCount);
               }
          });
     }

     handleEntryButton() {
          document.getElementById('entryButton').addEventListener('click', () => {
               //https://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
               document.getElementById('entryButton').classList.add('success');
               document.getElementById('listButton').classList.remove('success');
               document.getElementById('legacyButton').classList.remove('success');
               document.getElementById('legacy').style.display = 'none';
               document.getElementById('list').style.display = 'none';
               document.getElementById('listData').innerHTML = ``;
               document.getElementById('entry').style.display = 'block';
          });
     }

     handleListButton() {
          document.getElementById('listButton').addEventListener('click', () => {
               this.performAjax('XMLHttpRequest1', 0, (data) => {
                    data = JSON.parse(data);
                    let addHTML = document.createElement('table');
                    addHTML.innerHTML =
                         `<tr>
                       <td><strong>Date</strong></td>
                       <td><strong>Building</strong></td>
                       <td><strong>Room#</strong></td>
                       <td><strong>Priority</strong></td>
                       <td><strong>Challenge</strong></td>
                       <td><strong>Assignment</strong></td>
                       <td><strong>Status</strong></td>
                    </tr>`;
                    for (let i = 0; i < data.length; i++) {
                         addHTML.innerHTML +=
                              `<tr>
                            <td>${data[i].date}</td>
                            <td>${data[i].building}</td>
                            <td>${data[i].roomNumber}</td>
                            <td>${data[i].priority}</td>
                            <td>${data[i].problemDesc}</td>
                            <td>${data[i].assigned}</td>
                            <td>${data[i].status}</td>
                        </tr>`;
                    }
                    document.getElementById('listData').appendChild(addHTML);
                    let rows = document.getElementsByTagName('tr');
                    for (let i = 0; i < rows.length; i++) {
                         if (i % 2 === 0) {
                              rows[i].style.backgroundColor = `#eff0f1`;
                         }
                    }
                    document.getElementById('listButton').classList.add('success');
                    document.getElementById('entryButton').classList.remove('success');
                    document.getElementById('legacyButton').classList.remove('success');
                    document.getElementById('legacyData').innerHTML = ``;
                    document.getElementById('legacy').style.display = 'none';
                    document.getElementById('entry').style.display = 'none';
                    document.getElementById('list').style.display = 'block';
               });
          });
     }

     handleLegacyButton() {
          document.getElementById('legacyButton').addEventListener('click', () => {
               let password = prompt(`Please enter password: `);
               this.performAjax('XMLHttpRequest0', password, (response) => {
                    if (response === 'true') {
                         this.performAjax('XMLHttpRequest3', 0, (data) => {
                              data = JSON.parse(data);
                              let addHTML = document.createElement('table');
                              addHTML.innerHTML =
                                   `<tr>
                                <td><strong>Date</strong></td>
                                <td><strong>Building</strong></td>
                                <td><strong>Room#</strong></td>
                                <td><strong>Priority</strong></td>
                                <td><strong>Challenge</strong></td>
                                <td><strong>Assignment</strong></td>
                                <td><strong>Status</strong></td>
                            </tr>`;
                              for (let i = 0; i < data.length; i++) {
                                   if (Number(data[i].completed) === 1) {
                                        addHTML.innerHTML +=
                                             `<tr>
                                         <td>${data[i].date}</td>
                                         <td>${data[i].building}</td>
                                         <td>${data[i].roomNumber}</td>
                                         <td>${data[i].priority}</td>
                                         <td>${data[i].problemDesc}</td>
                                         <td>${data[i].assigned}</td>
                                         <td>${data[i].status}</td>
                                    </tr>`;
                                   }
                              }
                              document.getElementById('legacyData').appendChild(addHTML);
                              let rows = document.getElementsByTagName('tr');
                              for (let i = 0; i < rows.length; i++) {
                                   if (i % 2 === 0) {
                                        rows[i].style.backgroundColor = `#eff0f1`;
                                   }
                              }
                              document.getElementById('listButton').classList.remove('success');
                              document.getElementById('entryButton').classList.remove('success');
                              document.getElementById('legacyButton').classList.add('success');
                              document.getElementById('listData').innerHTML = ``;
                              document.getElementById('entry').style.display = 'none';
                              document.getElementById('list').style.display = 'none';
                              document.getElementById('legacy').style.display = 'block';
                         });
                    } else {
                         alert(`Incorrect password.`);
                    }
               });
          });
     }

     handleMaps() {
          document.getElementById('maps').addEventListener('change', () => {
               let element = document.getElementById('maps');
               let value = element.options[element.selectedIndex].value;  //https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
               switch (value) {
                    case 'Central1':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/central_1.pdf', '_blank');
                         break;
                    case 'Central2':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/central_2.pdf', '_blank');
                         break;
                    case 'Central3':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/central_3.pdf', '_blank');
                         break;
                    case 'Lincoln':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/Lincoln.pdf', '_blank');
                         break;
                    case 'Ottawa':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/Ottawa.pdf', '_blank');
                         break;
                    case 'Sheridan':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/Sheridan.pdf', '_blank');
                         break;
                    case 'PHS1':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/HS_1.pdf', '_blank');
                         break;
                    case 'PHS2':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/HS_2.pdf', '_blank');
                         break;
                    case 'PHS3':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/HS_3.pdf', '_blank');
                         break;
                    case 'PMS':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/MS_1.pdf', '_blank');
                         break;
                    case 'Spitler1':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/spitler_1.pdf', '_blank');
                         break;
                    case 'Spitler2':
                         window.open('http://resources.petoskeyschools.org/tech-bids/maps/spitler_2.pdf', '_blank');
                         break;
                    case 'SFX':
                         window.open('http://resources.petoskeyschools.org/', '_blank');
                         break;
                    case 'Stadium':
                         window.open('http://resources.petoskeyschools.org/', '_blank');
                         break;
                    default:
                         console.log(`Invalid choice`);
               }
          });
     }

     countWorkOrders(currentCount) {
          this.forwardCount = currentCount;
          document.getElementById('back').innerText = ` 0`;
          if (this.forwardCount > 0) {
               document.getElementById('forward').innerText = ` ${this.forwardCount - 1}`;
          } else {
               document.getElementById('forward').innerText = ` ${this.forwardCount}`;
          }
     }

     handleSubmit() {
          document.getElementById('submit').addEventListener('click', () => {
               if (!document.getElementById('submit').disabled) {
                    this.setButton(false);
                    let data = new FormData(document.querySelector('#mainForm'));
                    this.performAjax('XMLHttpRequest2', data, (done) => {
                         console.log(done);
                         this.backCount = 0;
                         this.forwardCount = 0;
                         if (document.getElementById('completed').checked) {
                              document.getElementById('result').innerText = 'Marked as complete. Thank you';
                              // window.location.reload(true);
                         } else {
                              document.getElementById('result').innerText = 'Request received. Thank you';
                              // document.getElementById('forward').innerText = ` ${this.forwardCount}`;
                         }
                         FadeStuff.doFade('in', 'result');
                         FadeStuff.doFade('out', 'result');
                         document.getElementById('mainForm').reset();
                         this.workList = [];
                         this.populateForm();
                    });
               }
          });
     }

     newEntry() {
          document.getElementById('newSubmission').addEventListener('click', () => {
               document.getElementById('id').value = null;
               // delete this.workList[this.counter].id;
               document.getElementById('mainForm').reset();
          });
     }

     goForward() {
          document.getElementById('forward').addEventListener('click', () => {
               this.counter++;
               if (this.counter < this.recordCount) {
                    this.backCount++;
                    this.forwardCount--;
                    document.getElementById('forward').innerText = ` ${this.forwardCount - 1}`;
                    document.getElementById('back').innerText = ` ${this.backCount}`;
                    this.putData();
               } else {
                    this.counter = this.recordCount - 1;
               }
          });
     }

     goBack() {
          document.getElementById('back').addEventListener('click', () => {
               this.counter--;
               if (this.counter >= 0) {
                    this.backCount--;
                    this.forwardCount++;
                    document.getElementById('back').innerText = ` ${this.backCount}`;
                    document.getElementById('forward').innerText = ` ${this.forwardCount - 1}`;
                    this.putData();
               } else {
                    this.counter = 0;
               }
          });
     }

     detectEdit() {
          document.getElementById('mainForm').addEventListener('input', () => {
               if (document.getElementById('problemDesc').value) {
                    this.setButton(true);
               } else {
                    this.setButton(false);
               }
          });
          document.getElementById('completed').addEventListener('click', () => {
               this.setButton(true);
          });
     }

     handleCompleted() {
          document.getElementById('completed').addEventListener('click', () => {
               if (document.getElementById('completed').checked) {

               }
          });
     }

     setButton(isEnabled) {
          if (isEnabled && document.getElementById('problemDesc').value) {
               document.getElementById('submit').disabled = false;
               document.getElementById('submit').classList.remove('disabled');
          } else {
               document.getElementById('submit').disabled = true;
               document.getElementById('submit').classList.add('disabled');
          }
     }

     setDate() {
          let date = new Date();
          document.getElementById('date').value = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
     }

     putData() {
          document.getElementById('building').value = this.workList[this.counter].building;  //http://stackoverflow.com/questions/10958112/select-object-value
          document.getElementById('roomNumber').value = this.workList[this.counter].roomNumber;
          document.getElementById('priority').value = this.workList[this.counter].priority;
          document.getElementById('submitter').value = this.workList[this.counter].submitter;
          document.getElementById('problemDesc').value = this.workList[this.counter].problemDesc;
          document.getElementById('assigned').value = this.workList[this.counter].assigned;
          document.getElementById('status').value = this.workList[this.counter].status;
          document.getElementById('id').value = this.workList[this.counter]._id;
     }

     performAjax(requestNum, sendToNode, callback) {
          let bustCache = '?' + new Date().getTime();
          const XHR = new XMLHttpRequest();
          XHR.open('POST', document.url + bustCache, true);
          XHR.setRequestHeader('X-Requested-with', requestNum);
          XHR.send(sendToNode);
          XHR.onload = () => {
               if (XHR.readyState === 4 && XHR.status === 200 && callback) {
                    return callback(XHR.responseText);
               }
          };
     }
}

//----------------------------------------------------------------------------------------------------------------------

class FadeStuff {
     constructor() {

     }

     static doFade(direction, fadeWhat) {
          //http://www.chrisbuttery.com/articles/fade-in-fade-out-with-javascript/
          let div = document.getElementById(fadeWhat);
          if (direction === "in") {
               div.style.opacity = 0;
               div.style.visibility = 'visible';
               (function fade() {
                    let val = parseFloat(div.style.opacity);
                    if (!((val += .01) >= 1)) {
                         div.style.opacity = val;
                         requestAnimationFrame(fade);
                    }
               })();
          } else if (direction === "out") {
               div.style.opacity = 1;
               (function fade() {
                    if ((div.style.opacity -= .01) <= 0) {
                         div.style.visibility = 'hidden';
                    } else {
                         requestAnimationFrame(fade);
                    }
               })();
          }
     }
}

window.addEventListener('load', () => {
     new main();
});