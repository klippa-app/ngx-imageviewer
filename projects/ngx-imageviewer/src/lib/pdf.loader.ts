import {PageInfo, ResourceLoader} from './imageviewer.model';
import {ImageCacheService} from './imagecache.service';
import {getDocument} from 'pdfjs-dist';
import {PDFDocumentProxy, PDFPageProxy} from 'pdfjs-dist/types/src/display/api';

export class PdfResourceLoader extends ResourceLoader {
  private _pageWidth: number;
  private _pageHeight: number;
  private _pdf: PDFDocumentProxy;
  private _page: PDFPageProxy;
  private _pendingReload: boolean;

  constructor(private _imageCache: ImageCacheService) {
    super();
    this.showItemsQuantity = true;
  }

  setUp() {
    const vm = this;
    if (vm.loading || !vm.src) { return; }
    const loadingTask = getDocument(vm.src);
    vm.loading = true;
    vm.currentItem = 1;
    loadingTask.promise.then((pdf: PDFDocumentProxy) => {
      vm._pdf = pdf;
      vm.totalItem = pdf.numPages;
      vm.loaded = true;
      vm.loadResource();
    }, (reason: string) => {
      console.error(reason);
    });
  }

  loadResource() {
    const vm = this;
    if (!vm.loaded) {
      vm._pendingReload = true;
      return;
    }
    vm.loaded = false;
    const url = vm.src;
    const page = vm.currentItem;

    vm._pdf.getPage(page).then((pdfPage) => {
      vm._page = pdfPage;
      vm.loadImage(url, page, () => {
        vm.loaded = true;
        vm.loading = false;
        if (vm._pendingReload) {
          vm._pendingReload = false;
          vm.loadResource();
        } else {
          vm.resourceChange.next();
        }
      });
    });
  }

  private loadImage(src: string, page: number, onFinish: () => void) {
    const vm = this;

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const pageVp = vm._page.getViewport({ scale: 2 });
    canvas.width = pageVp.width;
    canvas.height = pageVp.height;
    vm._pageWidth = pageVp.width;
    vm._pageHeight = pageVp.height;

    const cacheimg = vm._imageCache.getImage(src, page);
    if (cacheimg) {
      vm._image = cacheimg;
      onFinish();
      return;
    }

    const renderContext = {
      canvasContext: context,
      viewport: pageVp
    };
    const renderTask = vm._page.render(renderContext);
    renderTask.promise.then(() => {
      canvas.toBlob(blob => {
        const img = new Image();
        img.onload = onFinish;
        img.src = URL.createObjectURL(blob);
        vm._imageCache.saveImage(src, page, img);
        vm._image = img;
      });
    });
  }

  getCurrentPageInfo(): PageInfo {
    const vm = this;
    return {width: vm._pageWidth, height: vm._pageHeight, pageNumber: vm._page.pageNumber};
  }
}
