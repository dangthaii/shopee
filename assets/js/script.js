import productData from '../../data/productData.js';
import {cityNames} from '../../data/otherData.js'
// Global Variable
let accountArray = []
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

// 0. other Handle

// Common
function createElement(tag, list) {
   const element = document.createElement(tag)
   element.classList = list
   return element
}
function actionOnClasses(arr, action, className) {
   const keyHandle = {
      add(element) {
         element.classList.add(className)
      },
      remove(element) {
         element.classList.remove(className)
      },
      toggle(element) {
         element.classList.toggle(className)
      }

   }
   for (let element of arr) {
      keyHandle[action](element)
   }
}
function excludeHandle(arr, className, defaultElement = null) {
   function add(element) {
      actionOnClasses(arr, 'remove', className)
      element.classList.add(className)
   }

   if (defaultElement) add(defaultElement)
   for (let element of arr) {
      element.addEventListener('click', function() {
         add(element)
      })
   }
}
function actionOnAttributes(arr, attributeName, value) {
   for (let element of arr) {
      element[attributeName] = value
   }
}
function saveData(key, obj) {
   localStorage.setItem(key, JSON.stringify(obj))
}
function setData(key, attributeName, value) {
   const obj = JSON.parse(localStorage.getItem(key))
   obj[attributeName] = value
   saveData(key, obj)
}
function getData(key, attributeName) {
   const obj = JSON.parse(localStorage.getItem(key))
   return obj[attributeName]
}
function showModal(modal) {
   modal.classList.add('show-modal')
}
function hideModal(modal) {
   modal.classList.remove('show-modal')
}
function switchModal(fromModal, toModal) {
   hideModal(fromModal)
   showModal(toModal)
}
function movePage(classNameFrom, classNameTo) {
   $('.' + classNameFrom).classList.add('hide')
   $('.' + classNameTo).classList.remove('hide')
}
function priceTextToNumber(text) {
   let result =''
   for (let i = 0; i < text.length; i++) {
      if (text[i] != '.') result += text[i]
   }
   return Number(result)
}
function numberToPriceText(number) {
   number = number + ''
   const numberClone = number
   number = ''
   for (let i = 0; i < numberClone.length; i++) {
      if (numberClone[i] != '.') number += numberClone[i]
   }
   let result = ''
   for (let i = number.length - 1; i >= 0; i--) {
      result = number[i] + result
      const count = number.length - i
      if (count % 3 == 0 && i != 0) {
         result = '.' + result
      }
   }
   return result
}
function convertNumber(number) {
   if ((number + '').includes('.')) {
      return priceTextToNumber(number)
   } else {
      return numberToPriceText(number)
   }
}
// Toast handle
const duration = 3100
const toastRoot = document.getElementById('toast')
function getToast(type, content) {
   const toastType = {
      success: 'fa-solid fa-check',
      danger: 'fa-solid fa-xmark',
      warning: 'fa-solid fa-triangle-exclamation',
   }
   const toast = document.createElement('div')
   toast.classList.add('toast',`toast--${type}`)
   toast.innerHTML = 
   `<div class="icon__toast">
   <i class="${toastType[type]}"></i>
   </div>
   <span class="content__toast">
   ${content}
   </span>`
   return toast
}
function setToastContainer() {
   let timePoint = 0
   const resetTimePoint = function() {
      timePoint = 0
   }
   const setToast = function(toast, delayTime = 200) {
      let toastClone = toast.cloneNode(true)
      timePoint += delayTime
      if (toastRoot.childElementCount == 0) {
         toastRoot.appendChild(toastClone)
      }else {
         setTimeout(function() {
            toastRoot.appendChild(toastClone)
         }, timePoint)
      }
      setTimeout(function() {
         // Auto remove toast in toastRoot(container)
         toastRoot.removeChild(toastClone)
      }, duration + delayTime + timePoint)
   }
   const setToastOnce = function(toast, delayTime = 0) {
      setToast(toast, delayTime)
      resetTimePoint()
   }
   return [setToast, resetTimePoint, setToastOnce]
}
const [setToast, resetTimePoint, setToastOnce] = setToastContainer();

// 1. Login/Register handle
const loginModal = document.querySelector('.modal--login')
const regModal = document.querySelector('.modal--reg')
const qrloginModal = document.querySelector('.modal--qr');

// Handle toggle password icon
(function() {
   const passGroupForms = document.querySelectorAll('.form-group--pass')
   const showPass = `<i class="fa-solid fa-eye"></i>`
   const hidePass = `<i class="fa-solid fa-eye-slash"></i>`

   for (let passGroupForm of passGroupForms) {
      const inputForm = passGroupForm.querySelector('input')
      const iconContainer = passGroupForm.querySelector('.pass-toggle')
      inputForm.onkeyup = function(e) {
         if (e.target.value != '') {
            iconContainer.innerHTML = (inputForm.type == 'password') ? hidePass:showPass
         } else {
            iconContainer.innerHTML = ''
            inputForm.type = 'password' /* default type for security*/
         }
      }
      iconContainer.onclick = function() {
         if (inputForm.type == 'password') {
            iconContainer.innerHTML = showPass
            inputForm.type = 'text'
         }else {
            iconContainer.innerHTML = hidePass
            inputForm.type = 'password'
         }
      }
   }
})();

//Handle for modal
(function() {
   const wrappers = document.querySelectorAll('.modal')
   const modalBody = document.querySelectorAll('.modal__body')
   for (let i=0; i < wrappers.length; i++) {
      wrappers[i].onmousedown = function() {
         this.classList.remove('show-modal')
      }
      modalBody[i].onmousedown = function(e) {
         e.stopPropagation()
      }
   }
   
   // login modal
   const headerLoginBtn = document.querySelector('.header__login-item')
   
   headerLoginBtn.addEventListener('click',function(e) {
      showModal(loginModal)
   })
   // register modal
   const headerRegBtn = document.querySelector('.header__register-item')
   headerRegBtn.addEventListener('click',function(e) {
      showModal(regModal)
   })
   // qr-login modal
   document.querySelector('.modal--qr__switch-login').onclick = () => switchModal(qrloginModal, loginModal)
   document.querySelector('.modal--qr__swtich-reg').onclick = function(e) {
      e.preventDefault()
      switchModal(qrloginModal, regModal)
   };
})();

// states, setState function and affect
function stateHandle() {
   const states = {
      isLogined: false,
   }
   const getState = (name) => states[name]
   function setState(name, value, loadFirst = false) {
      if(loadFirst || (states[name] != value)) {
         states[name] = value
         const affect = {
            isLogined() {
               setData('loginInfo', 'isLogined', value)
               setStateToNavbar()
            }
         }
         affect[name]()
      }
      
   }

   // isLogined affect
   function actionLoginRegister(action) {
      const elements = document.querySelectorAll('.header__login-and-register')
      actionOnClasses(elements, action, 'hide')
   }
   function actionHeaderUser(action) {
      const element = document.querySelector('.header__login-user')
      actionOnClasses([element], action, 'hide')
   }
   function setUserName() {
      const element = document.querySelector('.header__user-username')
      element.innerText = getData('isLogined', 'user')
   }
   function setStateToNavbar() {
      if (getState('isLogined')) {
         actionHeaderUser('remove')
         actionLoginRegister('add')
         setUserName()
      }else {
         actionLoginRegister('remove')
         actionHeaderUser('add')
      }
   }

   return [getState, setState]
};
const [getState, setState] = stateHandle();
const setIsLogined = (value, loadFirst = false) => {setState('isLogined', value, loadFirst)}

// login action 
(function() {
   const checkbox = document.querySelector('.form-check .input-check')
   const text = document.querySelector('.form-check .text-check')
   const loginBtn = document.querySelector('.login-btn-js')
   const loginUser = document.querySelector('.user-login-js')
   const loginPass = document.querySelector('.pass-login-js')
   
   function setDataToInfo(user, pass, rememberAcc) {
      const info = {
         user, pass, rememberAcc
      }
      saveData('loginInfo', info)
   }
   var setDataToLogined = function(user, isLogined) {
      const obj = {
         user, isLogined
      }
      saveData('isLogined', obj)
      setIsLogined(obj.isLogined)
   }
   function loadData() {
      // Load remember account
      if (localStorage.getItem('loginInfo')) {
         let {user, pass, rememberAcc} = JSON.parse(localStorage.getItem('loginInfo'))
         // keep infomation on inputs
         loginUser.value = user
         loginPass.value = pass
         checkbox.checked = rememberAcc
      }
      // Load isLogined
      if (localStorage.getItem('isLogined')) {
         setIsLogined(getData('isLogined', 'isLogined'), true)
      }
   }
   function saveLogined() {
      
   }
   
   function checkLogin() {
      let loginCondition = false
      for (let account of accountArray) {
         if (account.user == loginUser.value) {
            if (account.pass == loginPass.value) {
               loginCondition = true
            }
            break
         }
      }
      return loginCondition
   }
   function login() {
      loginBtn.addEventListener('click', function(e) {
         e.preventDefault()
         // Keep infomation
         if (loginUser.value && loginPass.value) {
            if (checkbox.checked) {
               setDataToInfo(loginUser.value, loginPass.value, true)
            }else {
               setDataToInfo('', '', false)
            }
         }
         // Check login
         if (checkLogin()) {
            const toast = getToast('success', 'Đăng nhập thành công')
            setToastOnce(toast)
            const loginModal = document.querySelector('.modal--login')
            hideModal(loginModal)
            setDataToLogined(loginUser.value, true)
         }else {
            const toast = getToast('danger', 'Đăng nhập thất bại')
            setToastOnce(toast)
            setDataToLogined('', false)
         }
      })
   }
   function otherOnLoginModal() {
      const registerSwitch = document.querySelector('.modal__register-reg-text')
      const qrSwitch = document.querySelector('.modal--login__title-qr')
   
      registerSwitch.onclick = function(e) {
         e.preventDefault()
         switchModal(loginModal, regModal)
      }
      qrSwitch.onclick = () => switchModal(loginModal, qrloginModal)
   }
   function logOut() {
      const elements = document.querySelectorAll('.header__user-item')
      const signout = document.querySelector('.header__user-signout')
   
      for (let element of elements) {
         element.addEventListener('click', function(e) {
            e.preventDefault()
         })
      }
      signout.addEventListener('click', function() {
         setToastOnce(getToast('success','Đăng xuất thành công'))
         setDataToLogined('',false)
      })
   }

   loadData()
   login()
   otherOnLoginModal()
   logOut()
})();

// Register action
(function() {
   // Captcha generate
   const captchaBtn = document.querySelector('.modal--reg__captcha')
   const captchacodeElement = document.querySelector('.modal--reg__captcha-code')
   let captchaIconGen = document.querySelector('.modal--reg__captcha-icon')

   function generateCaptcha(length) {
      let result = ''
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      for (let i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return(result);
   }
   let captchaCode
   function getCodeForView() {
      captchaCode = generateCaptcha(5)
      captchacodeElement.innerText = captchaCode
   }
   getCodeForView()
   captchaBtn.onclick = getCodeForView
   captchaIconGen.onclick = getCodeForView
   // Register validation
   const userInput = document.querySelector('.user-reg-js')
   const passInput = document.querySelector('.pass-reg-js')
   const passConfirmInput = document.querySelector('.pass-reg-confirm-js')
   const captchaInput = document.querySelector('.captcha-input')
   const loginText = document.querySelector('.modal--reg__reg-text-js')
   const fieldName = {
      user : 'tên đăng nhập',
      pass: 'mật khẩu',
      passConfirm: 'lại mật khẩu',
      captcha: 'mã xác thực'
   }
   const regButton = document.querySelector('.reg-btn-js')
   const passConfirmToast = getToast('warning', 'Mật khẩu nhập lại chưa khớp ^^')
   const captchaToast = getToast('warning','Mã xác thực không chính xác rồi ^^')
   const registerSuccess = getToast('success', 'Đăng ký thành công')
   const loginContinue = getToast('success', 'Đăng nhập ngay thôi nào ^^')
   const existUserToast = getToast('danger', 'Tên đăng nhập đã tồn tại')

   function checkEmptyFields() {
      let emptyFields = []
      for (let field of arguments) {
         if (!field.value) emptyFields.push(fieldName[field.name])
      }
      return emptyFields.map(x => getToast('warning', 'Bạn chưa nhập ' + x))
   }

   regButton.addEventListener('click', function(e) {
      e.preventDefault()
      // refersh captcha every register request
      let emptyToast = checkEmptyFields(userInput, passInput, passConfirmInput, captchaInput)
      if (emptyToast.length != 0){
         emptyToast.map((x, y) => {
            setToast(x)
         })
      }else if (isUserExist(userInput.value)){
         setToast(existUserToast)
      }else if (passInput.value != passConfirmInput.value){
         setToast(passConfirmToast)
      }else if (captchaInput.value != captchaCode){
         setToast(captchaToast)
      }else {
         setToast(registerSuccess)
         storeAccount()
         setToast(loginContinue)
         switchModal(regModal, loginModal)
      }
      getCodeForView()
      resetTimePoint()
   })
   loginText.onclick = function(e) {
      e.preventDefault()
      switchModal(regModal, loginModal)
   }
   // Store account
   let id = 1
   if (localStorage.getItem('accountArray')) {
      accountArray = JSON.parse(localStorage.getItem('accountArray'))
      id = accountArray[accountArray.length - 1].id + 1
   }
   function isUserExist(name) {
      return accountArray.some(x => x.user == name)
   }
   function storeAccount() {
      const newAccount = {
         id,
         user: userInput.value,
         pass: passInput.value,
      }
      id += 1
      accountArray.push(newAccount)
      localStorage.setItem('accountArray', JSON.stringify(accountArray))
   }
})();

// 2. Header Other Handle

// Search input handle
(function() {
   const numberItemsOnView = 6
   const key = 'searchHistory'
   const rootElement = document.querySelector('.search-history__content')
   const inputElement = document.querySelector('.header__search-input')
   let currentItems = []
   let elementArray = []

   function getItem(content) {
      const element = document.createElement('a')
      element.href=""
      element.classList.add('search-history__item')
      element.innerText = content
      return element
   }
   function setItem(content) {
      elementArray.unshift(content)
      saveData()
      currentItems.pop()
      currentItems.unshift(content)
      updateView()
   }
   function saveData() {
      localStorage.setItem(key, JSON.stringify(elementArray))
   }
   function setItemToView(content) {
      rootElement.appendChild(getItem(content))
   }
   function getCurrentItems(itemsLength) {
      currentItems = elementArray.slice(0,Math.min(numberItemsOnView,itemsLength))
   }
   function loadItemsToView() {
      getCurrentItems(numberItemsOnView)
      for (let str of currentItems) {
         setItemToView(str)
      }
   }
   function updateView() {
      rootElement.innerHTML = ''
      for (let str of currentItems) {
         setItemToView(str)
      }
   }
   function loadData() {
      if (localStorage.getItem(key)) {
         elementArray = JSON.parse(localStorage.getItem(key))
         loadItemsToView()
      }
   }


   inputElement.onkeydown = function(e) {
      if (e.key == 'Enter' && this.value) {
         setItem(this.value)
         this.value = ''
      }
      
   }

   loadData()

})();
// Header search select
(function() {
   const textElement = document.querySelector('.header__select-label')
   const optionElements = document.querySelectorAll('.header__select-option')

   optionElements.forEach(function(element) {
      element.addEventListener('click', function() {
         optionElements.forEach(function(element) {
            element.classList.remove('checked')
         })
         this.classList.add('checked')
         textElement.innerText = this.innerText
      })
   })
})();
// Product view handle, add () on funtion to run
(function() {
   // Load products 
   const maxStringLength = 32

   function getItem(productObj) {
      const element = createElement('li', 'header__notify-item')
      element.innerHTML = 
         `<a href="" class="header__notify-link header__notify-product-item">
            <div class="header__product-select-container hide">
               <input type="checkbox" name="" id="" class="header__product-select">
            </div>
            <div class="header__product-select-container-expect-checkbox ml-10">
               <img class="header__product-img" src=${productObj.avatar} alt="" class="header__notify-img">
               <div class="header__product-center">
                  <span class="header__notify-title header__notify-product-title">
                     ${productObj.name.slice(0, maxStringLength) + ' ...'}
                  </span>
                  <span class="header__product-counter-number">
                     1
                  </span>
               </div>
            
               <span class="header__notify-price price-pre" data-price=${productObj.price}>${numberToPriceText(productObj.price)} 
                  <span class="header__notify-price-multiply">x</span>
                  <span class="header__notify-price-number">1</span>
               </span>
            </div>
         </a>`
      return element
   }
   function loadProductsToView() {
      const rootElement = document.querySelector('.header__product-list')
      const children = productData.map(x => getItem(x))
      for (let element of children) {
         rootElement.appendChild(element)
      }
   }

   loadProductsToView()
   // Optimize for checkbox and handle checkboxes counter
   const checkboxContainers = document.querySelectorAll('.header__product-select-container')
   const checkboxes = document.querySelectorAll('.header__product-select')
   const checkAll = document.querySelector('.header__product-footer-select')
   const productNumber = document.querySelector('.header__product-number')
   const selectBtn = document.querySelector('.header-product-select')
   const addBtn = document.querySelector('.header-product-add')
   const deleteBtn = document.querySelector('.header-product-delete')
   const totalElement = document.querySelector('.header__product-total-price')
   let checkCounter = 0
   let productSelectedNumber = 4
   let totalPrice = 571600

   function tickCheckbox(checkbox) {
      checkCounter = (checkbox.checked) ? checkCounter + 1: checkCounter - 1
      checkCounterAffect()
   }
   function isCheckCounterMax() {
      return checkCounter == checkboxes.length
   }
   function checkCounterAffect() {
      checkAll.checked = isCheckCounterMax()? true:false
      
      if (checkCounter == 1) {
         actionOnClasses([deleteBtn, addBtn], 'remove', 'hide')
      }
      if (checkCounter == 0) {
         toggleButtonsAndCheckboxes()
      }

   }
   
   

   checkboxContainers.forEach(function(element, i) {
      checkboxes[i].addEventListener('click', function(e) {
         e.stopPropagation()
         tickCheckbox(this)
      })
      element.addEventListener('click', function(e) {
         e.preventDefault()
         checkboxes[i].checked = !checkboxes[i].checked
         tickCheckbox(checkboxes[i])
      })
   })
   checkAll.addEventListener('click', function() {
      for (let checkbox of checkboxes) {
         checkbox.checked = this.checked
         checkCounter = (this.checked) ? checkboxes.length : 0
      }
      if (!checkAll.checked) {
         toggleButtonsAndCheckboxes()
      }else {
         actionOnClasses([deleteBtn, addBtn], 'remove', 'hide')
      }
   })
   // add more products and calculate price
   addBtn.addEventListener('click', function() {
      productSelectedNumber += checkCounter
      productNumber.innerText = productSelectedNumber
      for (let checkbox of checkboxes) {
         if (checkbox.checked) {
            const number = checkbox.parentElement.parentElement.querySelector('.header__product-counter-number')
            const newNumber = Number(number.innerText) + 1
            number.innerText = newNumber

            const priceElement = checkbox.parentElement.parentElement.querySelector('.header__notify-price')
            const unitPrice = Number(priceElement.getAttribute('data-price'))

            const priceNumber = priceElement.querySelector('.header__notify-price-number')
            priceNumber.innerText = newNumber

            totalPrice += unitPrice
            totalElement.innerText = numberToPriceText(totalPrice) 
         }
      }
   })
   // Select/unSelect/delete handle
   const exceptCheckboxContainers  = document.querySelectorAll('.header__product-select-container-expect-checkbox')

   function toggleButtonsAndCheckboxes() {
      actionOnClasses([...checkboxContainers, checkAll], 'toggle', 'hide')
      actionOnClasses(exceptCheckboxContainers, 'toggle', 'ml-10')

      const text = selectBtn.innerText
      if (text == 'Hủy chọn') {
         actionOnClasses([deleteBtn, addBtn], 'add', 'hide')
         actionOnAttributes([checkAll, ...checkboxes], 'checked', false)
         checkCounter = 0
      }
      selectBtn.innerText = (text == 'Chọn') ? 'Hủy chọn' : 'Chọn'
   }

   selectBtn.addEventListener('click', function() {
      toggleButtonsAndCheckboxes()
      
   })

});

// 3. Product Handle
(function() {
   const NUMBER_IN_A_ROW = 5
   const ROW_NUMBER_IN_A_PAGE = 5;
   const NUMBER_IN_A_PAGE = NUMBER_IN_A_ROW * ROW_NUMBER_IN_A_PAGE;
   let paginate;


   // Products 
   (function() {
      const rootElement = $('.product')

      function getProductHtml(obj) {
         const element = createElement('div','col-2-4')
         element.innerHTML = 
         `
            <a href="#" class="product-item-link">
               <div class="product-item" data-product-id="${obj.id}">
                  <div class="product-item__img" style="background-image: url('./assets/img/product/${getAvatar(obj)}.png');">
                  </div>
                  <div class="product-item-body">
                     <h5 class="product-item__name">
                        ${obj.name}
                     </h5>
                     <div class="product-item__price">
                        <span class="product-item__price-original price-pre text--muted">${convertNumber(obj.price)}</span>
                        <span class="product-item-price-saleoff price-pre">${convertNumber(obj.saleOffPrice)}</span>
                     </div>
                     <div class="product-item__statistic">
                        <div class="product-item__heart">
                           <i class="fa-solid fa-heart"></i>
                           <!-- <i class="fa-thin fa-heart"></i> -->
                        </div>
                        <div class="product-item__star-and-sold">
                           <div class="product-item__star">
                              <i class="fa-solid fa-star"></i>
                              <i class="fa-solid fa-star"></i>
                              <i class="fa-solid fa-star"></i>
                              <i class="fa-solid fa-star"></i>
                              <i class="fa-solid fa-star-half"></i>
                           </div>
                           <span class="product-item__sold">
                              Đã bán
                              <span class="product-item__sold-number">${convertThousandNumber(obj.sold)}</span>
                           </span>
                        </div>
                        
                     </div>
                     <div class="product-item__location">
                        <span class="product-item__shop-address city-place place--hanoi">Hà Nội</span>
                        <img src="./assets/img/container/free-delivery-truck.svg" alt="" class="product-item__freeship">
                     </div>
                  </div>
                  
                  <span class="product-item__favourite">
                     Yêu thích
                  </span>
                  <div class="product-item__saleoff">
                     <span class="product-item__saleoff-number">${calculateSaleoffPercent(obj.saleOffPrice, obj.price)}%</span>
                  </div>
               </div>
            </a>
         `
         return element
      }
      function convertThousandNumber(number) {
         let str
         if (number >= 1000) {
            str = (number + '').slice(0,-2)
            if (str[str.length-1] != '0') {
               str = str.slice(0,-1) + ',' + str[str.length - 1]
            }else {
               str = str.slice(0,-1)
            }
            str += 'k'
            return str
         }else {
            return number
         }
      }
      function calculateSaleoffPercent(smaller,larger) {
         return (Math.floor((larger - smaller)/larger * 100))
      }
      function getAvatar(obj) {
         return (obj.ava) ? obj.ava:obj.id
      }
      function fakeData(number) {
         const length = productData.length
         for (let i = 0; i < number; i++) {
            const randomIndex = Math.floor(Math.random() * (length))
            productData.push({...productData[randomIndex], id : length + 1 + i, ava: productData[randomIndex].id})
         }
      }
      function pushToView(productData) {
         rootElement.innerHTML = ''
         let row
         for (let i = 0; i < productData.length; i++) {
            if (i == 0 || (i + 1 % NUMBER_IN_A_ROW) == 0 ) {
               row = createElement('div', 'row')
               rootElement.appendChild(row)
            }
            row.appendChild(getProductHtml(productData[i]))
         }
      }
      paginate = function(pageNumber) {
         const len = productData.length
         const productFrom = (pageNumber - 1) * NUMBER_IN_A_PAGE + 1
         const productTo = Math.min(NUMBER_IN_A_PAGE * pageNumber, (Math.floor(len/NUMBER_IN_A_PAGE) - pageNumber + 2) * len)
         pushToView(productData.slice(productFrom - 1, productTo))
      }

      fakeData(525)
      paginate(1)
   })();
   // Category
   (function() {
      const categoryItems = $$('.category-item')
      excludeHandle(categoryItems, 'category-item--active')
   })();
   // pagination
   (function() {
      const optionBtns = $$('.sortby__option-button')
      const prevBtn = $('.sortby__move-item-left')
      const nextBtn = $('.sortby__move-item-right')
      const nextPagination = $('.pagination-next')
      const prevPagination = $('.pagination-prev')
      const rootElement = $('.pagination-page')
      let current = 1;
      let max
      const currentCounter = $('.sortby__page-current')
   
      function initialize() {
         setMax()
         if (current == 1) actionOnClasses([prevPagination, prevBtn], 'add', 'btn--disabled')
         if (current == max) actionOnClasses([nextPagination, nextBtn], 'add', 'btn--disabled')
         paginationViewHandle()
      }
      function setMax() {
         $('.sortby__page-max').innerText = (productData.length % NUMBER_IN_A_PAGE == 0) ? productData.length / NUMBER_IN_A_PAGE : Math.floor(productData.length / NUMBER_IN_A_PAGE ) + 1
         max = Number($('.sortby__page-max').innerText)
      }
      function checkCurrent() {
         const className = 'btn--disabled'
         paginate(current)

         currentCounter.innerText = current
         if (current == 1) actionOnClasses([prevPagination, prevBtn], 'add', 'btn--disabled')
         if (current == max) actionOnClasses([nextPagination, nextBtn], 'add', 'btn--disabled')
         if (current == 2) actionOnClasses([prevPagination, prevBtn], 'remove', 'btn--disabled')
         if (current == max - 1 ) actionOnClasses([nextPagination, nextBtn], 'remove', 'btn--disabled')
         paginationViewHandle()
      }
      function pushArray(arr, from, to) {
         for (let i = from; i <= to; i++) {
            arr.push(i)
         }
      }
      function pushNextTwo(arr) {
         if (max - current <= 3) {
            pushArray(arr, current + 1, max)
         }
         else if (max >= current + 3) {
            pushArray(arr, current + 1, current + 2)
            arr.push('...')
         }else if (max >= current + 2) {
            pushArray(arr, current + 1, current + 2)
         }else if (max >= current + 1) {
            pushArray(arr, current + 1, current + 1)
         }
      }
      function createPaginationArray() {
         let arr = []
         if (current <= 5 ) {
            arr = []
            pushArray(arr, 1, current)
            pushNextTwo(arr)
         }else {
            arr = []
            pushArray(arr, 1, 2)
            arr.push('...')
            pushArray(arr, current - 2, current)
            pushNextTwo(arr)
         }

         return arr
      }
      function paginationViewHandle() {
         const arr = createPaginationArray()
         const htmls = arr.map(value => 
            `
               <li class="pagination-item">
                  <a href="#category__container" class="pagination-item-link btn ">${value}</a>
               </li>
            `
         )
         rootElement.innerHTML = htmls.join('')
         const items = $$('.pagination-item-link')
         for (let i = 0; i < items.length; i++) {
            if (items[i].innerHTML == current) {
               actionOnClasses(items,'remove','pagination-item-link--active')
               items[i].classList.add('pagination-item-link--active')
               break
            }
         }
         updateRender()
      }
      function updateRender() {
         const paginationLink = $$('.pagination-item-link')
         for (let i = 0; i < paginationLink.length; i++) {
            const num = Number(paginationLink[i].innerText)
            if (num) {
               if (num == current) {
                  paginationLink[i].addEventListener('click', function(e) {
                     e.preventDefault()
                  })
               }else {
                  paginationLink[i].addEventListener('click', function() {
                     current = num
                     checkCurrent()
                  })
               }
            }else if (paginationLink[i].innerText == '...') {
               paginationLink[i].classList.add('cursor--default')
               paginationLink[i].addEventListener('click', function(e) {
                  e.preventDefault()
               })
            }
         }

      }
      function nextPage(e) {
         if (current < max) {
            current = current + 1
            checkCurrent()
         }else {
            e.preventDefault()
         }
      }
      function prevPage(e) {
         if (current > 1) {
            current = current - 1
            checkCurrent()
         }else {
            e.preventDefault()
         }
      }
   
      initialize()
      excludeHandle(optionBtns, 'sortby__option--active')
      nextBtn.addEventListener('click',(e) => nextPage(e))
      prevBtn.addEventListener('click',(e) => prevPage(e))
      nextPagination.addEventListener('click',(e) => nextPage(e))
      prevPagination.addEventListener('click',(e) => prevPage(e))
   })();
   // Filter places
   (function() {
      const root = $('.category__filter-places')
      const placesRoot = $('.category__places-list')
      const mainCities = ['Hà Nội', 'Đà Nẵng', 'Quảng Nam', 'Hồ Chí Minh', 'Nghệ An']
      const moreRoot = $('.category__places-filter-more')
      let otherCities = []

      function renderOtherCitiesList() {
         const htmls = otherCities.map(value => 
            `
               <li class="category__places-list-item">
                  ${value}
               </li>
            `   
         )
         placesRoot.innerHTML = htmls.join('')
      }
      function setOtherCities() {
         otherCities = [...cityNames]
         for (let i = 0; i < otherCities.length; i++) {
            if (mainCities.includes(otherCities[i])) {
               otherCities.splice(i, 1)
            } 
         }
         otherCities.sort()
      }
      function updateView(addedElement = null) {
         const items = $$('.category__places-item.city-place')
         excludeHandle(items, 'category__places-item--active', addedElement)
      }
      function selectListCities() {
         const items = $$('.category__places-list-item')
         items.forEach(function(item) {
            item.addEventListener('click', function() {
               const element = createElement('span', 'category__places-item city-place place--other')
               element.innerText = this.innerText
               root.insertBefore(element, moreRoot)
               item.remove()
               updateView(element)
            })
         })
      }
      updateView()
      function places() {
         updateView()
         setOtherCities()
         renderOtherCitiesList()
         selectListCities()

      }

      places()
      

   })();
   // Price range filter
   (function() {
      const inputs = $$('.category__price-range-input')
      const inputFrom = inputs[0]
      const inputTo = inputs[1]
      const upFrom = $('.category__price-range-input-icon-up-from')
      const downFrom = $('.category__price-range-input-icon-down-from')
      const upTo = $('.category__price-range-input-icon-up-to')
      const downTo = $('.category__price-range-input-icon-down-to')

      function numberChange(number, type) {
         let baseNumber = '1'
         let quantity
         number = number + ''
         if (number.length <= 4) {
            quantity = 4
         }else if (number.length == 5) {
            quantity = 4
         }else if (number.length <= 6) {
            quantity = number.length - 1
         }
         for (let i = 1; i < quantity; i++) {
            baseNumber += '0'
         }
         if (type == 'plus') return Number(number) + Number(baseNumber)
         if (type == 'minus') return Number(number) - Number(baseNumber)
      }
      function updateInputTo() {
         if (inputFrom.value.length >= 4 || Number(inputFrom.value) == 0 ) {
            inputTo.value = numberToPriceText(priceTextToNumber(inputFrom.value) + 100000)
         }

      }
      function inputHandle() {
         inputs.forEach(function(input) {
            input.addEventListener('input', function(e) {
               const value = e.target.value
               if (value.length >= 4) {
                  e.target.value = numberToPriceText(value)
                  if (this == inputFrom) {
                     updateInputTo()
                  }
               }else {
                  inputTo.value = ''
               }
            })
         })
      }
      function btnHandle() {
         upFrom.addEventListener('click', function() {
            inputFrom.value = convertNumber(numberChange(priceTextToNumber(inputFrom.value), 'plus'))
            updateInputTo()
         })

         upTo.addEventListener('click', function() {
            inputTo.value = convertNumber(numberChange(priceTextToNumber(inputTo.value), 'plus'))
         })

         downFrom.addEventListener('click', function() {
            const numberChanged = convertNumber(numberChange(priceTextToNumber(inputFrom.value), 'minus'))
            if (priceTextToNumber(numberChanged) >= 0) {
               inputFrom.value = numberChanged
               updateInputTo()
            }
         })

         downTo.addEventListener('click', function() {
            const numberChanged = convertNumber(numberChange(priceTextToNumber(inputTo.value), 'minus'))
            if (priceTextToNumber(numberChanged) >= 0) {
               inputTo.value = numberChanged
            }
         })
      }

      inputHandle()
      btnHandle()

   })();
   // Stars filter
   (function() {
      const items = $$('.category__filter-star-item')
      excludeHandle(items, 'category__filter-star-item--active')
   })();
})();

// 4.Detail product handle
(function productDetail(productId = 1) {
   const productItem = getProductItem()

   function getProductItem() {
      for (let i = 0; i < productData.length; i++) {
         if (productData[i].id == productId) return productData[i]
      }
      return null
   }

   // Other
   (function() {
      function movePageBtn() {
         $('.testing__move--detail').onclick = () => {
            if ($('.detail__container').classList.contains('hide')) {
               movePage('category__container', 'detail__container')
            }else {
               movePage('detail__container', 'category__container')
            }
         }
      }
      
      movePageBtn()
   })();

   // Slide
   (function() {
      const NUMBER_IMG_ON_A_ROW = 5
      const max = productItem.slideNumber
      let firstNumber

      function setImg(id) {
         $('.detail__product-img').style = `background-image: url('./assets/img/product/${productId}/${id}.png');`;
      }
      function loadImgs(start) {
         let htmls = ''
         firstNumber = start
         for (let i = start; i < start + NUMBER_IMG_ON_A_ROW; i++) {
            htmls += 
               `
               <div class="detail__product-slide-img img-background" data-id = "${i}" style="background-image: url('./assets/img/product/${productId}/${i}.png');;"></div>
               `
         }
         $('.detail__product-slide-img-wrap').innerHTML = htmls
         imgHandle()
      }
      function imgHandle() {
         const items = $$('.detail__product-slide-img')
         items[0].classList.add('detail__product-slide-img--active')
         setImg(items[0].getAttribute('data-id'))
         items.forEach(function(item) {
            item.addEventListener('mouseover', function() {
               setImg(item.getAttribute('data-id'))
               items.forEach(function(item) {
                  item.classList.remove('detail__product-slide-img--active')
               }) 
               this.classList.add('detail__product-slide-img--active')
            })
         })
      }
      function btnHandle() {
         const nextBtn = $('.detail__product-slide-next')
         const prevBtn = $('.detail__product-slide-prev')
         nextBtn.addEventListener('click', function() {
            if (firstNumber + NUMBER_IMG_ON_A_ROW <= max) {
               loadImgs(firstNumber + 1)
            }
         })
         prevBtn.addEventListener('click', function() {
            if (firstNumber > 1) {
               loadImgs(firstNumber - 1)
            }
         })

      }
      function initialize() {
         setImg(1)
         loadImgs(1)
         btnHandle()
      }

      initialize()
   })()
   
})();





// 100. Test area
(function() {

   function logContainer() {
      let counter = 0
      const increase = function(a,b) {
         counter ++
      }
      return increase
   }


})();



