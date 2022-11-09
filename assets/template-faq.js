const faqPage = document.getElementById('faq-page');
const dynamicFAQs = document.querySelectorAll('.dynamic-faq-block');
const faqWrapper = document.createElement('div');
faqWrapper.id = 'faq-listing';

dynamicFAQs.forEach(child => {
    faqWrapper.appendChild(child);
});

// faqPage.appendChild(faqWrapper);

const questionsParent = document.querySelector('[data-questionsParent]');
questionsParent.appendChild(faqWrapper);

function faqSelected(currentTarget) {
    var faqTitleLIst = currentTarget.closest('[data-faq]');
    var allElements = faqTitleLIst.querySelectorAll("li");

    allElements.forEach(element => {
        if (element.querySelector("a").classList.contains('active')) {
            element.querySelector("a").classList.remove("active");
        }
    });
    currentTarget.classList.add('active');
}