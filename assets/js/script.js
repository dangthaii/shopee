import productData_m from '../../data/productData.js';
import {cityNames} from '../../data/otherData.js'
import userData_m from '../../data/userData.js'
import cmtData_m from '../../data/commentData.js'
import cmtFakeData from '../../data/cmtFakeData.js';
import {detailHtml, categoryHtml, cart, sellHtml} from '../../data/htmlCode.js'

let productData = productData_m
let userData = userData_m
let cmtData = cmtData_m
let headerProduct = []
let isAllowedToRate
// Global Variable
let oriProduct, oriUser, oriCmt, fakeProduct = []
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
let loginedUser = {}, accountArray = []
let commentSlideInterval = null, isDetailFunctionRan = false, idInDetail
let nextCmtId, nextUserId, nextProductId
let matchProductName, matchShop
const totalPages = [$('.detail__container'), $('.category__container'), $('.sell__container')]

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
function onlyActive(arr, element, className) {
   actionOnClasses(arr, 'remove', className)
   element.classList.add(className)
}
function getNextCmtId() {
   nextCmtId += 1
   return nextCmtId
}
function getNextUserId() {
   nextUserId += 1
   return nextUserId
}
function getNextProductId() {
   nextProductId += 1
   return nextProductId
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
function cloneArray(arr) {
   return [...arr]
}
function whichHeart(root, id) {
   root.innerHTML = `<i class="fa-regular fa-heart"></i>`
   if (loginedUser.like?.includes(id)) {
      root.innerHTML = `<i class="fa-solid fa-heart"></i>`
      return true
   }else return false
}
function random(from, to) {
   return Math.floor(Math.random() * (to - from + 1)) + from
}
function renderToItems(arr, callback) {
   return arr.map(ele => callback(ele))
}
function randomNotRepeat(lengthArray) {
   const indexes = []
   const isChoose = []

   function isChooseAll() {
      for (let value of isChoose) {
         if (!value) return false
      }
      return true
   }

   for(let i = 0; i < lengthArray; i++) {
      isChoose.push(false)
   }
   while(!isChooseAll()) {
      const randomIndex = Math.floor(Math.random() * (lengthArray))
      if (!isChoose[randomIndex]) {
         indexes.push(randomIndex)
         isChoose[randomIndex] = true
      }
   }

   return indexes
}
function generateCaptcha(length) {
   let result = ''
   let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
   for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
   }
   return(result);
}
function determinePage() {
   return ($('.category__container').classList.contains('hide'))? 'detail' : 'category'
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
function loadData(name) {
   if (localStorage.getItem(name)) {
      const data = JSON.parse(localStorage.getItem(name))
      if (name == 'cmtData') cmtData = data
      if (name == 'userData') userData = data
      if (name == 'productData') productData = data
      if (name == 'headerProduct') headerProduct = data
   }
}
function saveCmt() {
   saveData('cmtData', cmtData)
}
function saveProduct() {
   saveData('productData', oriProduct)
}
function saveProductOnHeader() {
   saveData('headerProduct', headerProduct)
}
function saveUser() {
   saveData('userData', userData)
}
function saveLoginedUser() {
   saveData('isLogined', {user: loginedUser, isLogined: true})
}
function getLoading(content = 'Bạn chờ chút nhé!',callback = null, args = null, time = 400) {
   const root = $('.loading')
   $('.loading-text').innerText = content
   root.classList.remove('hide')
   setTimeout(function() {
      root.classList.add('hide')
      if (callback) callback(args)
   }, time)
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
   clearMemory()
}
function moveTo(className) {
   actionOnClasses(totalPages, 'add', 'hide')
   $('.' + className).classList.remove('hide')
   clearMemory()
}
function moveToHome() {
   getLoading('Đang tải trang') 
   setTimeout(() => {
      categoryView()
      window.scrollTo(0, 0)
   }, 400);
}
function clearMemory() {
   clearInterval(commentSlideInterval)
}
function getStar(number, className = null) {
   number = Number(number).toFixed(1)
   const arr = []
   let str = number + ''
   const first = str[0]
   const last = (str[2])
   for (let i = 0; i < first; i++) {
      arr.push('fa-solid fa-star')
   }
   let value = ''
   if (!last) value = 'fa-regular fa-star'
   else if (last <= 5 && last >=3) value = 'fa-solid fa-star-half'
   else if (last < 3) value = 'fa-regular fa-star'
   else value = 'fa-solid fa-star'
   if (Number(first) != 5) arr.push(value)
   for (let i = Number(first) + 1; i < 5; i++) {
      arr.push('fa-regular fa-star')
   }
   const htmls = arr.map(value => 
      `<i class="${value}${((className)? ` ${className}` : '')}"></i>`   
   ).join('')
   return htmls
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
function convertNumber(number) {
   if ((number + '').includes('.')) {
      return priceTextToNumber(number)
   } else {
      return numberToPriceText(number)
   }
}
function getCategoryName(id) {
   const arr = ['Điện thoại', 'Máy tính bảng', 'Gia đình', 'Tivi thông minh', 'Nhà sách', 'Đồng hồ']
   return arr[id]
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

// 0. Class
class Pagination {
   constructor(items, numInPage, root, prev, next, currentRoot, maxRoot, scrollToRoot = null) {
      this.items = items
      this.numInPage = numInPage
      this.max = Math.ceil(this.items.length/this.numInPage)
      this.root = root
      this.prev = prev
      this.next = next
      this.current = 1
      this.curretRoot = currentRoot
      this.maxRoot = maxRoot
      this.scrollToRoot = scrollToRoot
      this.initialize()
   }   

   initialize() {
      this.maxRoot.innerText = this.max
      if (this.max == 0) {
         actionOnClasses([this.prev, this.next], 'add', 'btn--disabled')
         this.curretRoot.innerText = 0
      }else {
         this.btnHandle()
         this.checkCurrent(true)
      }
   }

   btnHandle() {
      this.prev.classList.add('btn--disabled')
      this.next.addEventListener('click', () => {
         if (this.current < this.max) {
            this.current += 1
            this.checkCurrent()
         }
      })
      this.prev.addEventListener('click', () => {
         if (this.current > 1) {
            this.current -= 1
            this.checkCurrent()
         }
      })
   }

   checkCurrent(loadFirst = false){
      this.curretRoot.innerText = this.current
      
      if (!loadFirst) {
         getLoading('Đang lấy dữ liệu', function(args) {
            if (args[0]) args[0].scrollIntoView({behavior: 'smooth'})
            else args[1].scrollIntoView({behavior: 'smooth'})
         }, [this.scrollToRoot, this.root])
      }

      if (loadFirst) this.paginate(this.current)
      else setTimeout(() => {
         this.paginate(this.current)
      }, 400)

      if (this.current == 1) this.prev.classList.add('btn--disabled')
      if (this.current == this.max) this.next.classList.add('btn--disabled')
      if (this.current == 2) this.prev.classList.remove('btn--disabled')
      if (this.current == this.max - 1) this.next.classList.remove('btn--disabled')
   }

   paginate(num) {
      const len = this.items.length
      const numInPage = this.numInPage
      const from = (num - 1) * numInPage
      const to = (num == this.max)? len : num  * numInPage
      this.pushToView(this.items.slice(from, to))
   }

   pushToView(items) {
      this.root.innerHTML = ''
      items.forEach((item) => this.root.appendChild(item))
   }


}

// 0. Load data at first and data pre processing
(function loadDataAndPreProcessing() {
   // Load Data from LocalStorage if not load from data/[*data].js
   (function() {
      loadData('userData')
      loadData('cmtData')
      loadData('productData')
      loadData('headerProduct')
      nextCmtId = cmtData[cmtData.length - 1].id
      nextUserId = userData[userData.length - 1].id
      nextProductId = productData[productData.length - 1].id
   })();

   // user data
   (function() {
      oriUser = cloneArray(userData)
   })();
   
   // product data
   (function() {
      function fakeData(number) {
         const length = productData.length
         for (let i = 0; i < number; i++) {
            const randomIndex = Math.floor(Math.random() * (length))
            fakeProduct.push(productData[randomIndex])
         }
      }

      oriProduct = cloneArray(productData)
      fakeData(296)
   })();

   // Comment data
   (function() {
      function fakeCmt() {
         for (let i = 0; i < oriProduct.length; i++) {
            const productId = i + 1
            const number = []
            number.push(random(60, 200), random(5, 40), random(5, 20))
            const pinnedNum = random(0, 5)
            for (let ii = number.length - 1; ii >=0 ; ii--) {
               for (let num = 0; num < number[ii]; num++) {
                  let isPinned = false
                  if (ii == 0 && num >= number[ii] - pinnedNum && num <= number[ii] - 1) isPinned = true;

                  const userId = random(userData[0].id, userData[userData.length - 1].id)
                  let value, star
   
                  if (ii == 0) {
                     value = 'positive'
                     star = random(4, 5)
                     if (star == 4) star = random(4, 5)
                     if (star == 4) star = random(4, 5)
                  }
                  if (ii == 1) {
                     value = 'neutral'
                     star = random(3, 4)
                     if (star == 4) star = random(3, 4)
                  }
                  if (ii == 2) {
                     value = 'negative'
                     star = random(1, 2)
                  }
   
                  let content = ''
                  const arr = cmtFakeData[value]
                  const isChosen = []
                  for (let i = 0; i < arr.length - 1; i++) {
                     isChosen[i] = false
                  }
                  for (let i = 0; i < random(1, 3); i++) {
                     let index
                     do {
                        index = random(0, arr.length - 1)
                     } while(isChosen[index])
                     isChosen[index] = true
                     if (i != 0) content += `. ${arr[index]}`
                     else content += `${arr[index]}`
                  }
   
                  const cmt = {
                     "id": getNextCmtId(),
                     "userId": userId,
                     "productId": productId,
                     "star": star,
                     "isPinned": isPinned,
                     "content": content
                  }
         
                  cmtData.push(cmt)
   
               }
            }
         }
         saveCmt()
      }

      if (cmtData.length < 1000) fakeCmt()
      oriCmt = cloneArray(cmtData)

   })();

   // Render, calculate data for the first time
   (function() {
      function getCmts(productId) {
         const arr = []
         for (let i = 0; i < cmtData.length; i++) {
            if (cmtData[i].productId == productId) {
               arr.push(cmtData[i])
            }
         }
         return arr
      }
      function getShop(product) {
         for (let i = 0; i < userData.length; i++) {
            if (userData[i].id == product.shopId) return userData[i]
         }
         return null
      }
      function run() {
         for (let i = 0; i < oriProduct.length; i++) {
            const product = oriProduct[i]
            const shop = getShop(product)
            const cmts = getCmts(product.id)
            let average = 0
   
            product.address = shop.address
            cmts.forEach(function(cmt) {
               average += cmt.star
            })
            average /= cmts.length
            average = average.toFixed(1)
            product.averageStar = average
            product.isFavourited = (average >= 4.0) && (product.sold >= 100)
         }
         saveProduct()
      }
      
      if (!localStorage.getItem('loadedFirstTime')) {
         saveData('loadedFirstTime', '')
         run()
      }
   })();

   // Other handle
   (function() {
      productViewOnHeader()
   })();

})();

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
               renderPage()
            }
         }
         affect[name]()
      }
      
   }

   // isLogined affect
   function renderPage() {
      if (determinePage() == 'detail') productDetail(idInDetail)
      if (determinePage() == 'category') categoryView()
   }
   function actionLoginRegister(action) {
      const elements = document.querySelectorAll('.header__login-and-register')
      actionOnClasses(elements, action, 'hide')
   }
   function actionHeaderUser(action) {
      const element = document.querySelector('.header__login-user')
      actionOnClasses([element], action, 'hide')
   }
   function setUser() {
      const element = document.querySelector('.header__user-username')
      element.innerText = loginedUser.name
      $('.header__user-img').src = loginedUser.ava
   }
   function setStateToNavbar() {
      const sellBtn = $('.header__user-sell')
      const ownerBtn = $('.header__user-owner')
      if (getState('isLogined')) {
         actionHeaderUser('remove')
         actionLoginRegister('add')
         setUser()
         if (loginedUser.type == 1) {
            actionOnClasses([sellBtn, ownerBtn], 'remove', 'hide')
            ownerBtn.onclick = () => matchShop(loginedUser.id)
         } 
         else actionOnClasses([sellBtn, ownerBtn], 'add', 'hide')
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
      }else {
         setDataToInfo('', '', false)
      }
      // Load isLogined
      if (localStorage.getItem('isLogined')) {
         const isLogined = getData('isLogined', 'isLogined')
         if (isLogined) {
            loginedUser = getData('isLogined', 'user')
         }
         setIsLogined(isLogined, true)
      }else {
         saveData('isLogined', {user: {}, isLogined: false})
         setIsLogined(false, true)
      }
   }
   
   function checkLogin() {
      let loginCondition = false
      for (let account of userData) {
         if (account.name == loginUser.value) {
            if (account.pass == loginPass.value) {
               loginCondition = true
               loginedUser = account
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
            setDataToLogined(loginedUser, true)
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
         loginedUser = {}
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
   const buyerCheckbox = $('#reg-type--0')
   const sellerCheckbox = $('#reg-type--1')
   const addressDiv = $('.modal--reg__city')
   let type, address = -1
   
   const regButton = document.querySelector('.reg-btn-js')
   const passConfirmToast = getToast('warning', 'Mật khẩu nhập lại chưa khớp ^^')
   const captchaToast = getToast('warning','Mã xác thực không chính xác rồi ^^')
   const registerSuccess = getToast('success', 'Đăng ký thành công')
   const loginContinue = getToast('success', 'Đăng nhập ngay thôi nào ^^')
   const existUserToast = getToast('danger', 'Tên đăng nhập đã tồn tại')

   
   function btnHandle() {
      function checkboxHandle() {
         const list = $('.modal--reg__city-list')

         function buyerHandle() {
            addressDiv.classList.add('hide')
            regButton.classList.add('mt-0')
         }

         function sellerHandle() {
            regButton.classList.remove('mt-0')
            addressDiv.classList.remove('hide')
         }

         function cityHandle() {

            function getItem(content) {
               const item = createElement('li', 'modal--reg__city-item')
               item.innerText = content
               return item
            }

            function setView() {
               list.innerHTML = ''
               cityNames.forEach(function(value, i) {
                  const item = getItem(value)
                  list.appendChild(item)
                  item.addEventListener('click', function(e) {
                     e.stopPropagation()
                     address = i
                     $('.modal--reg__city-btn-text').innerText = value
                     list.classList.add('hide')
                  })
               })
            }

            setView()
         }

         function eventHandle() {
            $('.header__register-item').addEventListener('click', function() {
               showModal($('.modal--reg'))
               $('#reg-type--0').checked = true
               buyerHandle()
            })
   
            $('.header__become').addEventListener('click', function() {
               showModal($('.modal--reg'))
               $('#reg-type--1').checked = true
               sellerHandle()
            })
   
            buyerCheckbox.addEventListener('click', buyerHandle)
            sellerCheckbox.addEventListener('click', sellerHandle)
            $('.modal--reg__city-wrap').addEventListener('click', function() {
               list.classList.remove('hide')
            })
         }
         
         eventHandle()
         cityHandle()
      }

      function regBtnHandle() {
         const fieldName = {
            user : 'Bạn chưa nhập tên đăng nhập',
            pass: 'Bạn chưa nhập mật khẩu',
            passConfirm: 'Bạn chưa nhập lại mật khẩu',
            captcha: 'Bạn chưa nhập mã xác thực',
         }

         function checkEmptyFields() {
            let emptyFields = []
            for (let field of arguments) {
               if (!field.value) emptyFields.push(fieldName[field.name])
            }
            return emptyFields.map(x => getToast('warning', x))
         }
         
         function isUserExist(name) {
            return userData.some(x => x.name == name)
         }

         function storeAccount() {
            let type = 0
            if (buyerCheckbox.checked) address = 0
            else type = 1

            const newAccount = {
               id: getNextUserId(),
               name: userInput.value,
               pass: passInput.value,
               type, address,
               ava: `./assets/img/user/0/${random(1, 8)}.jpg`,
               like: []
            }
            userData.push(newAccount)
            saveUser()
         }
         
         function addEvent() {
            regButton.addEventListener('click', function(e) {
               e.preventDefault()
               let emptyToast = checkEmptyFields(userInput, passInput, passConfirmInput, captchaInput)
               if (sellerCheckbox.checked) {
                  if (!$('.modal--reg__city-input').value) {
                     emptyToast.push(getToast('warning', 'Bạn chưa nhập địa chỉ'))
                  }

                  if (address == -1) {
                     emptyToast.push(getToast('warning', 'Bạn chưa chọn thành phố'))
                  }
               }
               if (emptyToast.length != 0){
                  emptyToast.forEach((x) => {
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
         }

         addEvent()
         
      }

      function initialize() {
         loginText.onclick = function(e) {
            e.preventDefault()
            switchModal(regModal, loginModal)
         }
   
         checkboxHandle()
         regBtnHandle()
      }

      initialize()
      
   }
  
   function initialize() {
      btnHandle()
   }

   initialize()
})();

// 2. Header Other Handle

// Search input handle
(function() {
   const numberItemsOnView = 6
   const key = 'searchHistory'
   let rootElement
   const inputElement = document.querySelector('.header__search-input')
   const searchBtn = $('.header__search-btn')
   let currentItems = []
   let elementArray = []
   let isHasData = false

   function getItem(content) {
      const element = document.createElement('a')
      element.href=""
      element.classList.add('search-history__item')
      element.innerText = content
      element.addEventListener('mousedown', function(e) {
         e.preventDefault()
         inputElement.blur()
         matchProductName(content)
      })
      return element
   }
   function setItem(content) {
      elementArray.unshift(content)
      saveData()
      if (currentItems.length >= numberItemsOnView) currentItems.pop()
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
      currentItems = elementArray.slice(0, Math.min(numberItemsOnView,itemsLength))
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
   function getNoHistory() {
      return (`<div class="header__search-history--not">
      <div class="header__search-history--not-img">
         <i class="fa-light fa-face-smile"></i>
      </div>  
      <div class="header__search-history--not-text">Bạn tìm gì đó đi nào</div>
   </div>`)
   }
   function getHasHistory() {
      return (`<div class="search-history__header">
               <span>Lịch sử tìm kiếm</span>
            </div>
            <div class="search-history__content">
               
            </div>`)
   }
   function hasData() {
      $('.header__search-history').innerHTML = getHasHistory()
      rootElement = document.querySelector('.search-history__content')
   }
   function loadData() {
      if (localStorage.getItem(key)) {
         isHasData = true
         hasData()
         elementArray = JSON.parse(localStorage.getItem(key))
         loadItemsToView()
      }else {
         $('.header__search-history').innerHTML = getNoHistory()
      }
   }

   function btnHandle() {
      function searchEvent() {
         if (!isHasData) {
            hasData()
            elementArray = [inputElement.value]
            isHasData = true
         }
         setItem(inputElement.value)
         inputElement.blur()
         matchProductName(inputElement.value)
         inputElement.value = ''
      }

      function noInput() {
         const toast = getToast('warning', 'Bạn gõ gì vào đi chứ ^^')
         setToastOnce(toast)
      }
      inputElement.onkeydown = function(e) {
         if (e.key == 'Enter' && this.value) searchEvent()
         else if (e.key == 'Enter' && !this.value) noInput()
      }
      searchBtn.onclick = function(e) {
         if (!inputElement.value) noInput()
         else searchEvent()
      };
   }
   function initialize() {
      loadData()
      btnHandle()
   }

   initialize()



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
// Other 
(function() {
   $('.header__logo').onclick = moveToHome
})();
// add to cart
function productViewOnHeader() {
   // Load products 
   const maxStringLength = 30
   const count = {}
   let arr = []
   let checkboxes, checkboxContainers, productSelectedNumber, totalPrice, checkboxToObj, checkAll, productNumber, selectBtn, addBtn, deleteBtn
   let checkCounter = 0

   function getItem(productObj) {
      function otherHandle() {
         productSelectedNumber ++
         totalPrice += productObj.saleOffPrice * count[productObj.id]
         element.querySelector('.header__notify-product-item').addEventListener('click', function(e) {
            e.preventDefault()
         })
         checkboxToObj.set(element.querySelector('.header__product-select'), productObj)
      }

      const element = createElement('li', 'header__notify-item')
      element.innerHTML = 
         `<a href="" class="header__notify-link header__notify-product-item">
            <div class="header__product-select-container hide">
               <input type="checkbox" name="" id="" class="header__product-select">
            </div>
            <div class="header__product-select-container-expect-checkbox ml-10">
               <img class="header__product-img" src=${productObj.ava} alt="" class="header__notify-img">
               <div class="header__product-center">
                  <span class="header__notify-title header__notify-product-title">
                     ${productObj.name.slice(0, maxStringLength) + ' ...'}
                  </span>
                  <span class="header__product-counter-number">
                     ${count[productObj.id]}
                  </span>
               </div>
            
               <span class="header__notify-price price-pre" data-price=${productObj.saleOffPrice}>${numberToPriceText(productObj.saleOffPrice)} 
                  <span class="header__notify-price-multiply">x</span>
                  <span class="header__notify-price-number">${count[productObj.id]}</span>
               </span>
            </div>
         </a>`
      otherHandle()
      return element
   }
   function getNoCart() {
      return (`<div class="header-product-no-cart">
      <img class="header-product-no-cart-img" src="./assets/img/header_product/no-cart.png" alt="">
      <div class="header-product-no-cart-text">Chưa có sản phẩm nào</div>
   </div>`)
   }
   function loadProductsToView() {
      totalPrice = 0
      totalPrice = 0
      productSelectedNumber = 0
      checkboxToObj = new Map()
      const rootElement = document.querySelector('.header__product-list')
      rootElement.innerHTML = ''
      const children = arr.map(x => getItem(x))
      for (let element of children) {
         rootElement.appendChild(element)
      }

      $('.header__product-total-price').innerText = convertNumber(totalPrice)
      productNumber.innerText = productSelectedNumber

      checkboxContainers = $$('.header__product-select-container')
      checkboxes = $$('.header__product-select')
   }
   function countData() {
      arr = []
      for (let item of headerProduct) {
         if (!count[item.id]) {
            count[item.id] = 1
            arr.push(item)
         }else count[item.id] ++
      }
   }
   function render() {
      $('.header-product').innerHTML = cart
      checkAll = $('.header__product-footer-select')
      productNumber = $('.header__product-number')
      selectBtn = $('.header-product-select')
      addBtn = $('.header-product-add')
      deleteBtn = $('.header-product-delete')
   }
   function checkboxHandle() {
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
   }
   function btnHandle() {
      addBtn.addEventListener('click', function() {
         for (let checkbox of checkboxes) {
            if (checkbox.checked) {
               const obj = checkboxToObj.get(checkbox)
               headerProduct.push(obj)
               saveProductOnHeader()
               totalPrice += obj.saleOffPrice
               const number = ++ count[obj.id]
               const parent = checkbox.parentElement.parentElement
               parent.querySelector('.header__product-counter-number').innerText = number
               parent.querySelector('.header__notify-price-number').innerText = number
               $('.header__product-total-price').innerText = convertNumber(totalPrice)
               const toast = getToast('success', 'Thêm thành công')
               setToastOnce(toast)
            }
         }
      })

      deleteBtn.addEventListener('click', function() {
         for (let checkbox of checkboxes) {
            if (checkbox.checked) {
               const obj = checkboxToObj.get(checkbox)
               headerProduct = headerProduct.filter(function(ele) {
                  return ele.id != obj.id
               })
               saveProductOnHeader()     
               productViewOnHeader()
               const toast = getToast('success', 'Xóa thành công')
               setToastOnce(toast)
            }
         }
      })

      $('.btn-header-pay').addEventListener('click', function() {
         headerProduct = []
         saveProductOnHeader()
         productViewOnHeader()
         const toast1 = getToast('success', 'Thanh toán thành công')
         setToastOnce(toast1)
         const toast2 = getToast('success', 'Cảm ơn bạn đã mua hàng')
         setToastOnce(toast2, 1000)
      })

      
   }

   function initialize() {
      if (headerProduct.length == 0) {
         $('.header-product').innerHTML = getNoCart()
         $('.header__product-number').innerText = '0'
      }else {
         render()
         countData()
         loadProductsToView()
         checkboxHandle()
         btnHandle()
      }
   }

   initialize()

}
// 3. Product Handle
function categoryView() {
   const NUMBER_IN_A_ROW = 5 
   const ROW_NUMBER_IN_A_PAGE = 5;
   const NUMBER_IN_A_PAGE = NUMBER_IN_A_ROW * ROW_NUMBER_IN_A_PAGE;
   let categoryRender, getProductHtml
   let paginate, items;

   // Toolbox
   (function() {
      categoryRender = function(name) {
         $(`.${name}`).innerHTML = categoryHtml[name]
      }
      getProductHtml = function(obj) {
         function favourite() {
            if (obj.isFavourited) 
            return (`<span class="product-item__favourite">
               Yêu thích
               </span>`)
            else return ''
         }
         function getClasscity(id) {
            const obj = {
               'Hà Nội': 'place--hanoi',
               'Đà Nẵng' : 'place--danang',
               'Quảng Nam' : 'place--quangnam',
               'Hồ Chí Minh' : 'place--hcm',
               'Nghệ An' : 'place--nghean',
            }
            const value = obj[cityNames[id]]
            return (value == undefined)? 'place--other' : value
         }
         function getFreeshipIcon() {
            if (obj.isFreeship) 
            return (` <img src="./assets/img/container/free-delivery-truck.svg" alt="" class="product-item__freeship">`)
            else return (` <img src="./assets/img/container/truck.svg" alt="" class="product-item__freeship product-item__not-freeship">`)
         }
         function getHeart() {
            whichHeart(element.querySelector('.product-item__heart'), obj.id)
         }

         const element = createElement('div','col-2-4')
         element.innerHTML = 
         `
            <a href="#" class="product-item-link">
               <div class="product-item" data-product-id="${obj.id}">
                  <div class="product-item__img" style="background-image: url('${obj.ava}');">
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
                           
                        </div>
                        <div class="product-item__star-and-sold">
                           <div class="product-item__star">
                              ${getStar(obj.averageStar)}
                           </div>
                           <span class="product-item__sold">
                              Đã bán
                              <span class="product-item__sold-number">${convertThousandNumber(obj.sold)}</span>
                           </span>
                        </div>
                        
                     </div>
                     <div class="product-item__location">
                        <span class="product-item__shop-address city-place ${getClasscity(obj.address)}">${cityNames[obj.address]}</span>
                       ${getFreeshipIcon()}
                     </div>
                  </div>
                  ${favourite()}
                  <div class="product-item__saleoff">
                     <span class="product-item__saleoff-number">${calculateSaleoffPercent(obj.saleOffPrice, obj.price)}%</span>
                  </div>
               </div>
            </a>
         `

         getHeart()
         return element
      }
   })();
   // Initialize
   (function() {
      items = [...renderToItems(oriProduct, getProductHtml).reverse(), ...renderToItems(fakeProduct, getProductHtml)]
      moveTo('category__container')
      productHandle(items, undefined, true)
      filterHandle()
   })();
   // Products render
   function productHandle(items, loadingText = 'Đang tải trang', loadfirst = false) {
      const rootElement = $('.product')
      
      
      function pushToView(items) {
         rootElement.innerHTML = ''
         let row = createElement('div', 'row')
         rootElement.appendChild(row)
         for (let i = 0; i < items.length; i++) {
            row.appendChild(items[i])
         }
      }
      
      function otherHandle() {
         items.forEach(function(item) {
            item.addEventListener('click', function(e) {
               const id = item.querySelector('.product-item').getAttribute('data-product-id')
               e.preventDefault()
               getLoading('Đang tải sản phẩm', function(args) {
                  productDetail(args[0])
                  window.scrollTo(0, 0)
               }, [id])
            })
         })
      }
      paginate = function(pageNumber) {
         const len = items.length
         const productFrom = (pageNumber - 1) * NUMBER_IN_A_PAGE + 1
         const productTo = Math.min(NUMBER_IN_A_PAGE * pageNumber, (Math.floor(len/NUMBER_IN_A_PAGE) - pageNumber + 2) * len)
         pushToView(items.slice(productFrom - 1, productTo))
      }
      function initialize() {
         otherHandle()
         if (loadfirst) {
            paginationHandle(items);
            paginate(1)
         }
         else {
            getLoading(loadingText)
            setTimeout(function() {
               paginationHandle(items);
               paginate(1)
               window.scrollTo(0, 0)
            }, 400)
         }
      }

      initialize()

      
   }
   // pagination
   function paginationHandle(items) {
      let prevBtn, nextBtn, currentCounter, nextPagination, prevPagination
      let rootElement
      let current = 1, max
   
      function initialize() {
         function render() {
            categoryRender('sortby__pagination')
            prevBtn = $('.sortby__move-item-left')
            nextBtn = $('.sortby__move-item-right')
            currentCounter = $('.sortby__page-current')
            
            categoryRender('pagination')
            nextPagination = $('.pagination-next')
            prevPagination = $('.pagination-prev')
            rootElement = $('.pagination-page')

         }

         render()
         setMax()
         if (current == 1) actionOnClasses([prevPagination, prevBtn], 'add', 'btn--disabled')
         if (current == max) actionOnClasses([nextPagination, nextBtn], 'add', 'btn--disabled')
         paginationViewHandle()
      }
      function setMax() {
         $('.sortby__page-max').innerText = (items.length % NUMBER_IN_A_PAGE == 0) ? items.length / NUMBER_IN_A_PAGE : Math.floor(items.length / NUMBER_IN_A_PAGE ) + 1
         max = Number($('.sortby__page-max').innerText)
      }
      function checkCurrent() {
         const className = 'btn--disabled'
         
         getLoading('Đang tải trang', function() {
            window.scrollTo(0, 0)
         })
         setTimeout(function() {
            paginate(current)
            paginationViewHandle()
         }, 400)

         currentCounter.innerText = current
         if (current == 1) actionOnClasses([prevPagination, prevBtn], 'add', 'btn--disabled')
         if (current == max) actionOnClasses([nextPagination, nextBtn], 'add', 'btn--disabled')
         if (current == 2) actionOnClasses([prevPagination, prevBtn], 'remove', 'btn--disabled')
         if (current == max - 1 ) actionOnClasses([nextPagination, nextBtn], 'remove', 'btn--disabled')
      }

      function createPaginationArray() {
         let arr = []

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
                  paginationLink[i].addEventListener('click', function(e) {
                     e.preventDefault()
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
      nextBtn.addEventListener('click',(e) => nextPage(e))
      prevBtn.addEventListener('click',(e) => prevPage(e))
      nextPagination.addEventListener('click',(e) => nextPage(e))
      prevPagination.addEventListener('click',(e) => prevPage(e))
   }
   // Filter Render
   function filterHandle() {
      function render() {
         categoryRender('category')
         categoryRender('sortby__option')
      }
      function commonHandle() {
         excludeHandle($$('.sortby__option-button'), 'sortby__option--active')
         excludeHandle($$('.category__filter-star-item'), 'category__filter-star-item--active')
         excludeHandle($$('.category-item'), 'category-item--active')

         const priceSort = $$('.sortby__selection-item')
         priceSort.forEach(function(element) {
            element.addEventListener('click', function() {
               $('.sortby__selection-price span').innerText = `Giá: ${this.innerText}`
               actionOnClasses($$('.sortby__option-button'), 'remove', 'sortby__option--active')
            })
         })

         const newest = [$('.sortby__option-button--lastest'), $('.sortby__option-button--bestsell')]
         newest.forEach(function(item) {
            item.addEventListener('click', function() {
               $('.sortby__selection-price span').innerText = 'Giá'
            })
         })
      }
      function placesFilter() {
         const root = $('.category__filter-places')
         const placesRoot = $('.category__places-list')
         const mainCities = ['Hà Nội', 'Đà Nẵng', 'Quảng Nam', 'Hồ Chí Minh', 'Nghệ An']
         const moreRoot = $('.category__places-filter-more')
         let otherCities = []
         
         function setIdMainCity() {
            const cities = $$('.category__places-item.city-place')
            cities.forEach(item => item.setAttribute('data-id', cityNames.indexOf(item.innerText)))
         }
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
                  element.setAttribute('data-id', cityNames.indexOf(element.innerText))
                  root.insertBefore(element, moreRoot)
                  item.remove()
                  updateView(element)
               })
            })
         }
         updateView()
         function places() {
            setIdMainCity()
            updateView()
            setOtherCities()
            renderOtherCitiesList()
            selectListCities()
   
         }
   
         places()
      }
      function priceRangeFilter() {
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
   
      }
      function initialize() {
         render()
         commonHandle()
         placesFilter()
         priceRangeFilter()
         filterEvent()
      }

      initialize()
      

   }
   // Filter Event
   function filterEvent() {
      const conditions = []
      let arr = []
      let sortType = -1 

      function notify404() {
         return (`<div class="product-404">
                  <div class="product-404-icon">
                     <i class="fa-solid fa-face-grin-beam-sweat"></i>
                  </div>
                  <div class="product-404-text">Không tìm thấy sản phẩm theo yêu cầu</div>
               </div>`)
      }
      function pushToView(arr, loadingText = 'Đợi chút nhé') {
         const items = arr.map((item) => getProductHtml(item))
         productHandle(items, loadingText)
         if (arr.length == 0) setTimeout(function() {
            $('.product').innerHTML = notify404()
         }, 400) 
        
      }
      function filter(content, type) {
         for (let i = 0; i < conditions.length; i++) {
            if (conditions[i].type == type) {
               conditions.splice(i, 1)
               break
            }
         };
         conditions.push({content, type})
         arr = cloneArray(oriProduct)
         conditions.forEach(condition => arr = arr.filter(condition.content))
         sortby('filter')
      }
      function category() {
         const items = $$('.category-item ')
         items.forEach((item, i) => {
            let condition
            if (i == 0) condition = ele => true
            else condition = new Function('ele', `return ele.category == ${i - 1}`)
            item.addEventListener('click', (e) => {
               e.preventDefault()
               filter(condition, 'category')
            })
         })
      }
      function price() {
         const items = $$('.category__price-range-input')
         const from = items[0]
         const to = items[1]
         const btn = $('.category__price-range-btn')

         btn.addEventListener('click', function() {
            const condition = new Function('ele', `return ele.saleOffPrice >= ${convertNumber(from.value)} && ele.saleOffPrice <= ${convertNumber(to.value)} `)

            filter(condition, 'price')
         })
      }
      function sortby(callFrom = null) {

         if (sortType == 'latest') arr.sort(function(a,b) {
            return b.id - a.id
         })
         if (sortType == 'bestsell') arr.sort(function(a,b) {
            return b.sold - a.sold
         })
         if (sortType == 'increase') arr.sort(function(a, b) {
            return a.saleOffPrice - b.saleOffPrice
         })
         if (sortType == 'decrease') arr.sort(function(a, b) {
            return b.saleOffPrice - a.saleOffPrice
         })

         const str = (callFrom == 'filter')? 'Đang tìm kiếm' : 'Đang sắp xếp'
         pushToView(arr, str)
         
      }
      function sortHandle() {
         function changeType(element, type) {
            element.addEventListener('click', function() {
               sortType = type
               sortby('sort')
            })
         }

         const items = [...$$('.sortby__option-button'), ...$$('.sortby__selection-item')]
         items.forEach((item) => {
           changeType(item, item.getAttribute('data-type'))
         })

      }
      function places(runNow = false) {
         const items = $$('.category__places-item.city-place')
         items.forEach((item) => {
            const id = item.getAttribute('data-id')
            let condition
            if (id == -1) condition = item => true
            else condition = new Function ('ele', `return ele.address == ${id}`)
            item.addEventListener('click', () => filter(condition, 'places'))
            if (runNow) filter(condition, 'places')
         })
      }
      function star() {
         const items = $$('.category__filter-star-item')
         items.forEach(item => item.addEventListener('click', () => {
            let num = item.getAttribute('data-star')
            if (num == 5) num = 4.6
            const condition = new Function('item', `return Number(item.averageStar) >= ${num}`)
            console.log(condition);
            filter(condition, 'star')
         }))
      }
      function checkbox() {
         function main(ele, con, type, more = null) {
            ele.addEventListener('click', function() {
               const checkbox = this.querySelector('input')
               const condition = new Function('item', `${(more)? more + ';' : ''} return ${(checkbox.checked)? con : 'true'}`)
               console.log(condition);
               filter(condition, type)
            })
         }

         main($('.category__filter-other-item-favourite'), 'item.isFavourited == true', 'favourite')

         main($('.category__filter-other-item-freeship'), 'item.isFreeship == true', 'freeship')

         main($('.category__filter-other-item-bottoming'), 'per >= 40', 'bottoming', 'const per = Math.floor((item.price - item.saleOffPrice) / item.price * 100)')
         
      }
      matchProductName = function(content) {
         const condition = new Function('item', `return item.name.toLowerCase().includes('${content}'.toLowerCase().trim())`)
         filter(condition, 'nameSearch')

         setTimeout(function() {
            moveTo('category__container')
         }, 400) 
      }
      matchShop = function(id) {
         const condition = new Function('item', `return item.shopId == ${id}`)
         filter(condition, 'shopSearch')

         setTimeout(function() {
            moveTo('category__container')
         }, 400) 
      }
      function otherHandle() {
         $('.category__filter-deleteall').addEventListener('click', function() {
            productHandle(items, 'Về mặc định')
            setTimeout(function() {
               filterHandle()
            }, 400)
         })

         $$('.category__places-list-item').forEach(item => item.addEventListener('click', () => places(true)))
      }
      function initialize() {
         arr = cloneArray(oriProduct)
         category()
         price()
         places()
         star()
         checkbox()
         sortHandle()
         otherHandle()
      }
      
      initialize()
   }
   
};

categoryView()

// 4.Detail product handle
const productDetail = function(productId) {
   let cmtTotal = 0
   const productItem = getProductItem()
   const shopUser = getShopUser()
   const shopProduct = getShopProduct()
   const pinnedCmt = []
   const productCmt = getProductCmt()

   function getProductItem() {
      for (let i = 0; i < oriProduct.length; i++) {
         if (oriProduct[i].id == productId) return oriProduct[i]
      }
      return null
   }

   function getShopUser() {
      for (let i = 0; i < userData.length; i++) {
         if (userData[i].id == productItem.shopId) return userData[i]
      }
      return null
   }

   function getCmtAva(cmt) {
      for (let i = 0; i < userData.length; i++) {
         if (userData[i].id == cmt.userId) return userData[i].ava
      }
   }

   function getShopProduct() {
      const arr = []
      for (let i = 0; i < oriProduct.length; i++) {
         if (oriProduct[i].shopId == shopUser.id && oriProduct[i].id != productItem.id) {
            arr.push(oriProduct[i])
         }
      }
      return arr
   }
   function getProductCmt() {
      const arr = []
      const shopProductIds = shopProduct.map(item => item.id)
      
      shopProductIds.push(Number(productId))
      for (let i = 0; i < cmtData.length; i++) {
         const cmtId = cmtData[i].productId 
         if (shopProductIds.includes(cmtId)) {
            cmtTotal ++
            if (cmtId == productId) {
               arr.push(cmtData[i])
               if (cmtData[i].isPinned) {
                  pinnedCmt.push(cmtData[i])
               }
            }
         }
      }
      
      return arr
   }
   // initialize
   (function() {
      let isClicked = false
      isDetailFunctionRan = true
      idInDetail = productId
      
      function hoverStar() {
         const items = $$('.detail__rating-action-hover')
         function getItems(pos) {
            const arr = []
            for (let i = 0; i <= pos; i++) {
               arr.push(items[i])
            }
            return arr
         }

         items.forEach(function(item, id) {
            item.addEventListener('mouseenter', function() {
               if (!isClicked) {
                  actionOnClasses(getItems(items.length - 1), 'remove', 'detail__rating-action-hover--filled')
                  actionOnClasses(getItems(id), 'add', 'detail__rating-action-hover--filled')
               }
               
            })
            
            item.addEventListener('mouseleave', function() {
               if (!isClicked) {
                  actionOnClasses(getItems(id), 'remove', 'detail__rating-action-hover--filled')
               }
            })

            item.addEventListener('click', function() {
               isClicked = !isClicked
               if (isClicked) {
                  actionOnClasses(getItems(id), 'add', 'detail__rating-action-hover--filled')
                  onlyActive(items, this, 'detail__rating-action-hover--active' )
               }else {
                  actionOnClasses(getItems(items.length - 1), 'remove', 'detail__rating-action-hover--filled')
                  actionOnClasses(items, 'remove', 'detail__rating-action-hover--active')
               }
            })
            
         })
      }
      function render() {
         $('.detail__container').innerHTML = detailHtml
      }
      
      moveTo('detail__container')
      render()
      hoverStar()
      pinnedCmtHandle()
   })();

   // Slide
   (function() {
      const NUMBER_IMG_ON_A_ROW = 5
      const DEFAULT_MAX = 13
      const imgWrapper = $('.detail__product-slide-img-wrap')
      let typeBtn = Array.from($$('.detail__product-type-item')) 
      let max = productItem.slideNumber
      let maxFirst = productItem.slideNumber
      let current = 0, items = [], lastChild

      function setCurrent(value, callFrom = null) {
         const item = items[value]
         current = value
         setImg(current)
         onlyActive(items, item, 'detail__product-slide-img--active')
         // setImg(item.getAttribute('data-id'))

         // Map to typeBtns
         if (!callFrom) {
            const element = typeBtn.find((ele) => ele.getAttribute('data-type') - 1 == value)
            if (element) onlyActive(typeBtn, element, 'detail__product-type-item--active')
            else actionOnClasses(typeBtn, 'remove', 'detail__product-type-item--active')
         }
      }
      function setImg(id) {
         $('.detail__product-img').style.backgroundImage = items[id].style.backgroundImage

      }
      function typeBtnHandle() {
         excludeHandle(typeBtn, 'detail__product-type-item--active')
         typeBtn.forEach(function(btn) {
            const id = btn.getAttribute('data-type')
            let currentFirst 
            let isClicked
            btn.addEventListener('mouseenter', function(){
               isClicked = false
               currentFirst = current
               setCurrent(id - 1, 'typeBtnHandle')
            })
            btn.addEventListener('mouseleave', function() {
               if (!isClicked) setCurrent(currentFirst, 'typeBtnHandle')
            })
            btn.addEventListener('click', function() {
               isClicked = true
               setCurrent(id - 1, 'typeBtnHandle')
            })
         })
      }
      function loadImgs(start) {
         imgWrapper.innerHTML = ''
         lastChild = start + Math.min(NUMBER_IMG_ON_A_ROW, max) - 1
         for (let i = start; i < start + Math.min(NUMBER_IMG_ON_A_ROW, max); i++) {
            imgWrapper.appendChild(items[i])
            items[i].addEventListener('mouseenter', () => setCurrent(i))
         }
      }
      function loadImgTotal() {
         const loopNumber = (maxFirst == 0)? max : maxFirst
         for (let i = 0; i < loopNumber; i++) {
            let value
            const item = createElement('div', 'detail__product-slide-img img-background')
            item.setAttribute('data-id', i)
            if (i == 0) item.style.backgroundImage = `url('${productItem.ava}')`
            else {
               value = (maxFirst == 0)? `0/${i + 1}` : `${productId}/${i + 1}`
               item.style.backgroundImage = `url('./assets/img/product/${value}.png')`
            }
            items.push(item)
         }
      }
      function btnHandle() {
         const nextBtn = $('.detail__product-slide-next')
         const prevBtn = $('.detail__product-slide-prev')
         if (max <= NUMBER_IMG_ON_A_ROW && productItem.slideNumber != 0) {
            actionOnClasses([nextBtn, prevBtn], 'add', 'hide')
         }else {
            nextBtn.addEventListener('click', function() {
               if (current <= max - 2) {
                  if (current == lastChild) {
                     loadImgs(current - NUMBER_IMG_ON_A_ROW + 2)
                  }
                  setCurrent(current + 1)
               }
            })
            prevBtn.addEventListener('click', function() {
               if (current > 0) {
                  if (current == lastChild - NUMBER_IMG_ON_A_ROW + 1) {
                     loadImgs(current - 1)
                  }
                  setCurrent(current - 1)
               }
            })
         }
         

      }
      function initialize() {
         if (max == 0) max = DEFAULT_MAX
         loadImgTotal()
         loadImgs(0)
         setCurrent(0)
         btnHandle()
         typeBtnHandle()
      }

      initialize()
   })();
   // Comment
   (function() {
      let starAverage = 0
      const root = $('.detail__rating-comment-item-wrap')
      let items = []

      function getItem(obj) {
         function getPinedIcon() {
            if (obj.isPined) return (`<div class="detail__rating-comment-pin ">
            <i class="fa-solid fa-bookmark "></i>
         </div>`)
            else return ''
         }
         function getAdmin() {
            if (productItem.shopId == loginedUser.id) 
            return(`
               <div class="detail__rating-comment-more">
                  <i class="fa-solid fa-ellipsis-vertical"></i>
                  <ul class="detail__rating-comment-more-list hide">
                     <li class="detail__rating-comment-more-item detail__rating-comment-more-item--delete">
                     Xóa bình luận
                     </li>
                     <li class="detail__rating-comment-more-item detail__rating-comment-more-item--pin">
                     ${(obj.isPinned)? 'Cho xuống dưới' : 'Đưa lên đầu'}  
                     </li>
                  </ul>
               </div>
            `)
            else return ''
         }
         function eventHandle() {
            if (productItem.shopId == loginedUser.id) {

               function deleteEle(arr) {
                  for (let i = 0; i < arr.length; i++) {
                     if (arr[i] == obj) arr.splice(i, 1)
                  }
               }

               function deleteHandle() {
                  
                  deleteEle(productCmt)
                  deleteEle(cmtData)
                  deleteEle(pinnedCmt)
                  saveCmt()
                  setView()
                  pinnedCmtHandle()
                  
                  const toast = getToast('success', 'Xóa thành công')
                  setToastOnce(toast)
               }

               function pinHandle() {
                  obj.isPinned = !obj.isPinned
                  let toast
                  if (obj.isPinned) {
                     pinnedCmt.push(obj)
                     pinBtn.innerText = 'Cho xuống dưới'
                     toast = getToast('success', 'Đưa lên đầu thành công')
                  }else {
                     deleteEle(pinnedCmt)
                     pinBtn.innerText = 'Đưa lên đầu'
                     toast = getToast('success', 'Cho xuống dưới thành công')
                  }
                  setToastOnce(toast)
                  saveCmt()
                  pinnedCmtHandle()
               }

               const more = item.querySelector('.detail__rating-comment-more')
               const icon = more.querySelector('i')
               const list = item.querySelector('.detail__rating-comment-more-list')
               const deleteBtn = item.querySelector('.detail__rating-comment-more-item--delete')
               const pinBtn = item.querySelector('.detail__rating-comment-more-item--pin')
               

               more.addEventListener('click', function() {
                  const fun = function(e) {
                     if (e.target != more && e.target != icon) list.classList.add('hide')
                  }
                  list.classList.remove('hide')
                  document.addEventListener('click', e => fun(e))
               })

               deleteBtn.addEventListener('click', deleteHandle)
               pinBtn.addEventListener('click', pinHandle)
               
            }
         }
         // Find user
         let user = {}
         for (let i = 0; i < userData.length; i++) {
            if (userData[i].id == obj.userId) {
               user = userData[i]
               break
            }
         }

         const item = createElement('div', 'detail__rating-comment-item')
         item.setAttribute('data-id', obj.id)
         item.innerHTML =    
                  `
                     <div class="detail__rating-comment-ava">
                        <img src="${user.ava}" alt="" class="detail__rating-comment-avatar">
                     </div>
                     <div class="detail__rating-comment-wrapper">
                        <div class="detail__rating-comment-up">
                           <span class="detail__rating-comment-name">${user.name}</span>
                           <span class="detail__rating-comment-rated">đã đánh giá</span>
                           <span class="detail__rating-comment-star">
                              ${getStar(obj.star)}
                           </span>
                        </div>
                        <div class="detail__rating-comment-content">${obj.content}</div>
                     </div>
                     ${getPinedIcon()}
                     ${getAdmin()}
                  `
         eventHandle()
         return item
      }
      
      function setView() {
         const CMT_NUMBER_IN_A_PAGE = 10
         const ratingItems = $$('.detail__rating-overview-item')
         root.innerHTML = ''
         starAverage = 0
         const starStatistic = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
         }

         function setAnotherView(starStatistic) {
            function starAverageHandle() {
               const averageStarHtmlsAtRating = getStar(starAverage, 'detail__rating-score-icon')
               const averageStarHtmlsAtHeader = getStar(starAverage, 'detail__product-statistic-review-star')
               $('.detail__rating-score-star').innerHTML = averageStarHtmlsAtRating
               $('.detail__product-statistic-review-star-wrap').innerHTML = averageStarHtmlsAtHeader
      
               starAverage = `${starAverage}`
               if (starAverage[starAverage.length - 1] == '0' && starAverage.length != 1) starAverage = starAverage[0]
               $('.detail__product-statistic-review-number-average ').innerText = starAverage
               $('.detail__rating-score-point').innerText = starAverage
            }
   
            function starStatisticHandle() {
               const items = $$('.detail__rating-overview-item')
   
               function filterEvent(num) {
                  function content() {
                     $('.detail__rating-pagination').innerHTML = 
                     `
                        <button class="sortby__move-item sortby__move-item-left btn detail__rating-pagination--prev btn--disabled">
                           <i class="fa-regular fa-angle-left"></i>
                        </button>
                        <div class="detail__rating-pagination-page">
                           <span class="sortby__page-current detail__rating-pagination-current">
                              1
                           </span>
                           /
                           <span class="sortby__page-max detail__rating-pagination-current-max">13</span>
                        </div>
                        <button class="sortby__move-item  sortby__move-item-right btn detail__rating-pagination--next">
                           <i class="fa-regular fa-angle-right"></i>
                        </button>
                     `
                     const items = []
                     const arr = (typeof(num) == 'number')? productCmt.filter((item) => item.star == num) : productCmt
                     root.innerHTML = ''
                     for (let i = arr.length - 1; i >=0 ; i--) {
                        const item = getItem(arr[i])
                        items.push(item)
                     }
                     const paginate = new Pagination(items, CMT_NUMBER_IN_A_PAGE, root, $('.detail__rating-pagination--prev'), $('.detail__rating-pagination--next'), $('.detail__rating-pagination-current'), $('.detail__rating-pagination-current-max'), $('.detail__rating-overview'))
                  }
                  getLoading('Đang lấy dữ liệu')
                  setTimeout(content, 300)
                  
               }
   
               excludeHandle(items, 'detail__rating-overview-item--active')
               for (let i = 1; i <= 5; i++) {
                  const item = $(`.detail__rating-overview-number[data-number="${i}"]`)
                  item.innerText = starStatistic[i]
                  item.parentElement.onclick = () => filterEvent(i)
               }
               items[0].onclick = () => filterEvent('all')
            }
   
            starAverageHandle()
            starStatisticHandle()
         }

         onlyActive(ratingItems, ratingItems[0], 'detail__rating-overview-item--active')  
         $('.detail__product-statistic-comment-number').innerText = convertThousandNumber(productCmt.length)
         items = []
         for (let i = productCmt.length - 1; i >=0 ; i--) {
            const item = getItem(productCmt[i])
            starAverage += productCmt[i].star
            starStatistic[productCmt[i].star] += 1
            items.push(item)
            root.appendChild(item)
         }
         const paginate = new Pagination(items, CMT_NUMBER_IN_A_PAGE, root, $('.detail__rating-pagination--prev'), $('.detail__rating-pagination--next'), $('.detail__rating-pagination-current'), $('.detail__rating-pagination-current-max'), $('.detail__rating-overview'))
         if (starAverage) {
            starAverage = starAverage / productCmt.length
            starAverage = starAverage.toFixed(1)
         }
         
         productItem.averageStar = Number(starAverage)
         saveProduct()
         setAnotherView(starStatistic)
      }

      isAllowedToRate = function() {
         const btn = $('.detail__rating-action-btn')
         isDetailFunctionRan = true
         const state = getState('isLogined')

         function comment() {
            const input = $('.detail__rating-action-input')
            const CONTENT_MIN = 20  
            let selectedStarNumber = 0

            function getSelectedStarNumber() {
               const item = $('.detail__rating-action-hover--active')
               if (item) return Number(item.getAttribute('data-number')) 
               else return 0
               return 0
            }
            function checkSpam() {
               const str = input.value 
               for (let char of str) {
                  if (char != str[0]) return false
               }
               return true
            }
            function rateSuccessfully() {
               setToastOnce(getToast('success', 'Cảm ơn bạn đã đánh giá 😉'))
               const cmt = {
                  "id" : getNextCmtId(),
                  "userId" : loginedUser.id,
                  "productId" : productId,
                  "star" : selectedStarNumber,
                  "isPinned" : false,
                  "content" : input.value
               }
               cmtData.push(cmt)
               productCmt.push(cmt)
               saveCmt()
               input.value = ''
               showChatView(true)
               setView()
               $('.detail__rating-overview').scrollIntoView()
            }

            btn.addEventListener('click', function() {
               selectedStarNumber = getSelectedStarNumber()
               if (input.value == '') setToastOnce(getToast('warning', 'Bạn cần nói gì đi chứ ^^'))
               else if(input.value.length < CONTENT_MIN) setToastOnce(getToast('warning', 'Đánh giá của bạn ngắn quá, viết thêm nữa đi ^^'))
               else if (checkSpam()) setToastOnce(getToast('warning', 'Thôi nào, đừng spam thế chứ ^^'))
               else if(!selectedStarNumber) setToastOnce(getToast('warning', 'Lựa chọn số sao đánh giá đi nào ^^'))
               else rateSuccessfully()

            })
         }

         if (state) {
            comment()
         }else {
            btn.addEventListener('click', () => setToastOnce(getToast('danger', 'Bạn cần đăng nhập để bình luận')))
            setView()
         }
      }
      function showChatView(show = false) {
         const action = (show)? 'remove':'add'
         actionOnClasses([$('.detail__rating-overview'), $('.detail__rating-pagination')], action, 'hide')
      }
      function initialize() {
         root.innerHTML = ''
         if (productCmt.length == 0) showChatView(false)
         setView()
         isAllowedToRate()
      }

      initialize()
   })();
   // pinned Comment slide
   function pinnedCmtHandle() {
      let items = []
      let circles = []
      const TIME_DURING = 5000
      const ANIMATION_DURING_OUT = 500
      let index = 0
      let isRan = false
      const root = $('.detail__rating-pin-comment-wrap')

      function autoAddComment() {
         commentSlideInterval = setInterval(function() {
            // prevIndex hanlde
            index = circleIndex(index)
            let prevIndex = circleIndex(index, 'minus')
            items[prevIndex].classList.remove('slide-in')
            items[prevIndex].classList.add('slide-out')
            if (isRan) {
               setTimeout(function() {
                  root.removeChild(items[prevIndex])
               }, ANIMATION_DURING_OUT)
            }else isRan = true
            // index handle
            items[index].classList.remove('slide-out')
            items[index].classList.add('slide-in')
            root.appendChild(items[index])
            setCircle()
         }, TIME_DURING)
      }
      function setCircle(i = index) {
         actionOnClasses(circles, 'remove', 'detail__rating-pin-circle-item--active')
         circles[i].classList.add('detail__rating-pin-circle-item--active')
      }
      function getItem(ava, content) {
         const item = createElement('div', 'detail__rating-pin-comment')
         item.innerHTML = 
            `
            <img src="${ava}" alt="" class="detail__rating-pin-avatar">
            <div class="detail__rating-pin-content-wrapper">
               <span class="detail__rating-pin-content ">${content}</span>
            </div>
            `
         return item
      }
      function circleIndex(i, type = 'plus') {
         if (type == 'plus') {
            i = (i == items.length - 1)? 0 : i + 1
         }else {
            i = (i == 0)? items.length - 1 : i - 1
         }
         return i
      }
      function setComment(i) {
         index = i
         setCircle(i)
         clearInterval(commentSlideInterval)
         actionOnClasses(items, 'remove', 'slide-in')
         actionOnClasses(items, 'remove', 'slide-out')
         assignItem(i)
         if (items.length > 1) autoAddComment()
      }
      function initializeCircle() {
         const circleRoot = $('.detail__rating-pin-circle')
         circleRoot.innerHTML = ''
         for (let i = 0; i < items.length; i++) {
            const item = createElement('span', 'detail__rating-pin-circle-item')
            circles.push(item)
            item.addEventListener('click', () => setComment(i))
            circleRoot.appendChild(item)
         }
         setCircle(0)
      }      
      function assignItem(i) {
         root.innerHTML = ''
         root.appendChild(items[i])
      }
      function btnHandle() {
         $('.detail__rating-pin-next').addEventListener('click', function() {
            index = circleIndex(index)
            setComment(index)
         })

         $('.detail__rating-pin-prev').addEventListener('click', function() {
            index = circleIndex(index, 'minus')            
            setComment(index)
         })
      }
      function render() {
         items = items.map(item => getItem(getCmtAva(item), item.content))
         assignItem(0)
         initializeCircle()
         if (items.length > 1) autoAddComment()
         btnHandle()
         
      }
      function initialize() {
         clearInterval(commentSlideInterval)
         const rootParent = $('.detail__rating-pin')
         root.innerHTML = ''
         items = pinnedCmt
         if (items.length == 0) rootParent.classList.add('hide')
         else {
            rootParent.classList.remove('hide')
            render()
         }
      }  
          
      initialize()
   }
   // Fill basic data
   (function () {
      $('.detail__breadcrumb-item-value').innerText = getCategoryName(productItem.category)
      $('.detail__product-title-content').innerText = productItem.name
      $('.detail__breadcrumb-item-name').innerText = productItem.name
      $('.detail__product-statistic-sold-number').innerText = convertThousandNumber(productItem.sold)
      $('.detail__product-price--original').innerText = convertNumber(productItem.price)
      $('.detail__product-price--saleoff').innerText = convertNumber(productItem.saleOffPrice)
      $('.detail__product-price-percent-number').innerText = calculateSaleoffPercent(productItem.saleOffPrice, productItem.price)
      $('.detail__describe-content').innerText = productItem.describe
      $('.detail__shop-img').src = `${shopUser.ava}`
      $('.detail__shop-name').innerText = shopUser.name
      $('.detail__shop-number--product').innerText = shopProduct.length + 1
      $('.detail__product-statistic-comment-number').innerText = convertThousandNumber(productCmt.length)
      $('.detail__shop-number--comment').innerText = convertThousandNumber(cmtTotal)

      const favourite = $('.detail__product-title-favourite')
      if (!productItem.isFavourited) favourite.classList.add('hide')

      if (!productItem.isFreeship) {
         $('.detail__product-other-freeship--text1').innerText = 'Có phí vận chuyển'
         $('.detail__product-other-freeship-img').src = './assets/img/container/truck.svg'
         $('.detail__product-other-freeship-img').classList.add('detail__product-other-not-freeship-img')
      }

   })();
   // Other handle
   (function() {
      // other random product of shop
      (function() {
         const RANDOM_NUMBER = 5
         const root = $('.detail__other-item-wrapper')

         function getItem(obj) {
            const item = createElement('a', 'detail__other-item')
            item.href = "#"
            item.innerHTML = 
                  `
                     <div class="detail__other-img img-background" style="background-image: url('${obj.ava}');">
                     </div>
                     <h4 class="detail__other-name">${obj.name}
                     </h4>
                     <div class="detail__other-price price-pre">${convertNumber(obj.price)}</div>
                  `
            return item
         }
         function setView() {
            if (shopProduct.length == 0) {
               $('.custom-col--right').className = 'col-12';
               $('.custom-col--left').className = 'hide';
            }
            root.innerHTML = ''
            const randomIndexes = randomNotRepeat(shopProduct.length)
            for (let i = 0; i < Math.min(RANDOM_NUMBER, shopProduct.length); i++) {
               const item = getItem(shopProduct[randomIndexes[i]])
               root.appendChild(item)
               item.addEventListener('click', function(e) {
                  e.preventDefault()
                  getLoading('Đang tải sản phẩm', function(args) {
                     window.scrollTo(0, 0)
                     productDetail(args[0])
                  }, [shopProduct[randomIndexes[i]].id])
               })
            }
         }

         setView()
      })();
      // Product Header
      (function() {
         function addCart() {
            $('.detail__product-other-add').addEventListener('click', function() {
               const toast = getToast('success', 'Thêm vào giỏ hàng thành công')
               setToastOnce(toast)
               for (let i = 0; i < Number($('.detail__product-number--quantity').innerText); i++) {
                  headerProduct.push(productItem)
               }
               saveProductOnHeader()
               productViewOnHeader()
            })
         }

         addCart()
         
      })();
      // Other handle
      (function() {
         function otherHandle() {
            $('.detail__breadcrumb-link').onclick = (e) => {
               e.preventDefault()
               moveToHome()
            }
            $('.detail__shop-view').onclick = () => matchShop(shopUser.id)
         }

         function social() {
            $$('.detail__product-social-icon').forEach(item => item.addEventListener('click', function() {
               const toast = getToast('success', 'Cảm ơn bạn đã chia sẻ ^^')
               setToastOnce(toast)
            }))
         }

         function like() {
            const root = $('.detail__product-social-heart-icon')
            const number = $('.detail__product-social-like-number')

            function btnHandle() {
               let like = whichHeart(root, productItem.id)

               root.addEventListener('click', function() {
                  function saveData() {
                     for (let i = 0; i < userData.length; i++) {
                        if (userData[i].id == loginedUser.id) {
                           userData[i] = loginedUser
                           break;
                        }
                     }
                     saveLoginedUser()
                     saveUser()
                  }
                  if (getState('isLogined')) {
                     if (!like) {
                        loginedUser.like.push(productItem.id)
                        saveData()
                        like = whichHeart(root, productItem.id)
                        $('.detail__product-social-heart-icon').classList.add('detail__product-social-heart-icon--click')
                        number.innerText = Number(number.innerText) + 1
                        const toast = getToast('success', 'Shop cảm ơn bạn nhiều ^^')
                        setToastOnce(toast)
                     }else {
                        const arr = loginedUser.like
                        for (let i = 0; i < arr.length; i++) {
                           if (arr[i] == productItem.id) arr.splice(i, 1)
                        }
                        saveData()
                        like = whichHeart(root, productItem.id)
                        $('.detail__product-social-heart-icon').classList.remove('detail__product-social-heart-icon--click')
                        number.innerText = Number(number.innerText) - 1
                        const toast = getToast('success', 'Bạn đã bỏ like sản phẩm')
                        setToastOnce(toast)
                     }
                     
                  }else {
                     const toast = getToast('danger', 'Bạn cần đăng nhập để like sản phẩm')
                     setToastOnce(toast)
                  }
               })
            }

            function determineNumber() {
               let total = 0
               userData.forEach(user => {
                  if (user.like.includes(productItem.id)) total += 1
               })
               number.innerText = total
            }

            function initialize() {
               btnHandle()
               determineNumber()
            }

            initialize()
            
         }

         function voucher() {
            const vouchers = $$('.detail__product-voucher-tag')
            excludeHandle(vouchers, 'detail__product-voucher-tag--active')

            vouchers.forEach(item => item.addEventListener('click', function() {
               const quantity = item.getAttribute('data-voucher') * 1000
               const saleOffPrice = Math.max(productItem.saleOffPrice - quantity, 0)
               $('.detail__product-price--saleoff').innerText = convertNumber(saleOffPrice)
               $('.detail__product-price-percent-number').innerText = calculateSaleoffPercent(saleOffPrice, productItem.price)
            }))
         }

         function buyBtn() {
            $('.detail__product-other-buy').onclick = function() {
               const toast1 = getToast('success', 'Thanh toán thành công')
               setToastOnce(toast1)
               const toast2 = getToast('success', 'Cảm ơn bạn đã mua hàng')
               setToastOnce(toast2, 1000)
            }
         }

         function productBuyCounter() {
            const number = $('.detail__product-number--quantity')

            $('.detail__product-number--minus').onclick = function() {
               if (number.innerText > 1) number.innerText = Number(number.innerText) - 1
            }
            $('.detail__product-number--plus').onclick = function() {
               number.innerText = Number(number.innerText) + 1
            }
         }

         function initialize() {
            voucher()
            buyBtn()
            productBuyCounter()
            social()
            like()
            otherHandle()
         }

         initialize()
         

         
         
      })()
   })();
};


// 5. sell product
function sellProduct() {
   let category = 0

   function categoryHandle() {
      $('.sell-category').addEventListener('click', function() {
         $('.sell-list').classList.remove('hide')
      })

      $$('.sell-item').forEach(function(item, i) {
         item.addEventListener('click', function(e) {
            category = i
            e.stopPropagation()
            $('.sell-category-text').innerText = item.innerText
            $('.sell-list').classList.add('hide')
         })
      })
   }

   function btnHandle() {
      $('.header__user-sell').onclick = function() {
         moveTo('sell__container')
         sellProduct()
      }

      $('.sell-btn').onclick = function() {
         const product = {
            id: getNextProductId(),
            name: $('.sell-name').value,
            price: Number($('.sell-price').value),
            saleOffPrice: Number($('.sell-saleOff').value),
            describe: $('.sell-describe').value,
            isFreeship : $('#sell-freeship').checked,
            category, 
            slideNumber: 0,
            ava: `./assets/img/product/00/${category}.png`,
            averageStar: 0,
            isFavourited: false,
            sold: 0,
            address: loginedUser.address,
            shopId: loginedUser.id,
            like: [],
         }

         const toast = getToast('success', 'Đăng bán thành công')
         setToastOnce(toast)
         $('.sell-link').classList.remove('hide')
         productData.push(product)
         oriProduct.push(product)
         saveProduct()
         
      }

      $('.sell-link').onclick = () => {
         getLoading('Đang tải trang')
         setTimeout(categoryView, 400)
      }
   }

   function initialize() {
      render()
      categoryHandle()
      btnHandle()
   }

   function render() {
      $('.sell__container').innerHTML = sellHtml
   }

   initialize()
}

sellProduct();



// test area
(function() {
   const obj1 = {
      test : 'test'
   }
   const obj3 = [4, 5, 6]
   const obj = {
      [obj1] : 'okok',
      2 : 'z',
      [obj3] : 'zok'
   }
   
   const obj2 = {

   }

})();