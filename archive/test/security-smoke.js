import { connectPracticeChooser, createSafeMarkdownFragment } from '../reader.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

window.addEventListener('load', async () => {
  const fixture = document.getElementById('fixture');
  const result = document.getElementById('result');
  try {
    const markdown = [
      '# Archived problem',
      '',
      'A normal [external link](https://example.com/solution) and $x < y$.',
      '',
      '<b>Allowed historical formatting</b>',
      '',
      '![Reviewed local figure](../../2025_AMC_12A_Problems/media/problem-05-nested-squares.svg)',
      '<img src="https://attacker.invalid/evil.svg" onerror="window.xssImage = true">',
      '<script>window.xssScript = true</script>',
      '<iframe src="https://attacker.invalid"></iframe>',
      '<a href="javascript:window.xssHref = true" onclick="window.xssClick = true">bad link</a>',
      '[also bad](java\nscript:window.xssMarkdown = true)'
    ].join('\n');

    fixture.replaceChildren(createSafeMarkdownFragment(markdown));
    assert(fixture.querySelector('h1')?.textContent === 'Archived problem', 'heading did not render');
    assert(fixture.querySelector('b')?.textContent === 'Allowed historical formatting', 'safe formatting did not render');
    assert(fixture.textContent.includes('\\(x < y\\)'), 'TeX was not restored as text');
    const reviewedImage = fixture.querySelector('img[alt="Reviewed local figure"]');
    assert(reviewedImage?.getAttribute('src')?.endsWith('/2025_AMC_12A_Problems/media/problem-05-nested-squares.svg'), 'reviewed local image did not survive sanitization');
    assert(!fixture.querySelector('script, iframe, svg, style'), 'forbidden markup survived sanitization');
    assert(![...fixture.querySelectorAll('img')].some((image) => image.src.includes('attacker.invalid')), 'remote image survived sanitization');
    assert(![...fixture.querySelectorAll('*')].some((node) => [...node.attributes].some((attribute) => attribute.name.startsWith('on'))), 'event handler survived sanitization');
    assert(![...fixture.querySelectorAll('a')].some((link) => /^javascript:/i.test(link.getAttribute('href') || '')), 'unsafe href survived sanitization');
    const external = fixture.querySelector('a[href="https://example.com/solution"]');
    assert(external?.target === '_blank' && external.rel.includes('noopener'), 'external link is not opener-isolated');
    fixture.append(document.createTextNode('\\(\\href{javascript:window.xssMath = true}{unsafe TeX link}\\)'));
    await window.MathJax.typesetPromise([fixture]);
    assert(!fixture.querySelector('a[href^="javascript:"]'), 'unsafe TeX link survived MathJax processing');
    assert(!window.xssImage && !window.xssScript && !window.xssHref && !window.xssClick && !window.xssMarkdown, 'payload executed');

    const originalLocation = window.location.href;
    const trigger = document.createElement('a');
    const chooser = document.createElement('dialog');
    const practiceOption = document.createElement('a');
    const batchOption = document.createElement('a');
    const cancelButton = document.createElement('button');
    const paperLabel = document.createElement('p');
    let currentPaper = { year: 2024, variant: 'B' };
    trigger.href = 'practice/';
    cancelButton.type = 'button';
    chooser.append(paperLabel, practiceOption, batchOption, cancelButton);
    document.body.append(trigger, chooser);
    const refreshChooser = connectPracticeChooser({
      trigger,
      dialog: chooser,
      practiceOption,
      batchOption,
      cancelButton,
      paperLabel,
      getCurrentPaper: () => currentPaper
    });
    const directNavigationAllowed = trigger.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    }));
    assert(!directNavigationAllowed, 'Practice entry did not prevent direct navigation');
    assert(chooser.open, 'Practice entry did not open a modal chooser');
    assert(practiceOption.getAttribute('href') === 'practice/?form=amc12-2024-b&mode=practice', 'Practice choice lost its paper identity');
    assert(batchOption.getAttribute('href') === 'practice/?form=amc12-2024-b&mode=batch', 'Batch choice lost its paper identity');
    const chooserSnapshot = {
      hash: window.location.hash,
      description: paperLabel.textContent,
      practiceHref: practiceOption.getAttribute('href'),
      batchHref: batchOption.getAttribute('href')
    };
    const backgroundArrowNavigation = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      window.location.hash = '#unexpected-navigation';
      paperLabel.textContent = 'Unexpected paper';
      practiceOption.href = 'practice/?form=amc12-2002-a&mode=practice';
      batchOption.href = 'practice/?form=amc12-2002-a&mode=batch';
    };
    document.addEventListener('keydown', backgroundArrowNavigation);
    practiceOption.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'ArrowRight', bubbles: true, cancelable: true
    }));
    document.removeEventListener('keydown', backgroundArrowNavigation);
    assert(window.location.hash === chooserSnapshot.hash, 'Arrow key reached background Archive navigation');
    assert(paperLabel.textContent === chooserSnapshot.description, 'Arrow key changed the chooser paper description');
    assert(practiceOption.getAttribute('href') === chooserSnapshot.practiceHref, 'Arrow key changed the Practice destination');
    assert(batchOption.getAttribute('href') === chooserSnapshot.batchHref, 'Arrow key changed the batch destination');
    cancelButton.click();
    assert(!chooser.open && window.location.href === originalLocation, 'Cancel did not remain on the archive page');
    currentPaper = { year: 2022, variant: 'A' };
    refreshChooser();
    assert(batchOption.getAttribute('href') === 'practice/?form=amc12-2022-a&mode=batch', 'Chooser did not follow Archive paper changes');
    document.body.dataset.testStatus = 'pass';
    result.textContent = 'PASS';
  } catch (error) {
    document.body.dataset.testStatus = 'fail';
    result.textContent = `FAIL: ${error.message}`;
  }
});
