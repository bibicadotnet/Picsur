import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoUnsubscribe } from 'ngx-auto-unsubscribe-decorator';
import { ImageFileType } from 'picsur-shared/dist/dto/mimes.dto';
import { EImage } from 'picsur-shared/dist/entities/image.entity';
import { HasFailed } from 'picsur-shared/dist/types/failable';
import { ImageService } from 'src/app/services/api/image.service';
import { Logger } from 'src/app/services/logger/logger.service';
import { BootstrapService, BSScreenSize } from 'src/app/util/bootstrap.service';
import { DialogService } from 'src/app/util/dialog-manager/dialog.service';
import { ErrorService } from 'src/app/util/error-manager/error.service';

@Component({
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss'],
})
export class ImagesComponent implements OnInit {
  private readonly logger: Logger = new Logger(ImagesComponent.name);

  images: EImage[] | null = null;
  columns = 1;

  page: number = 1;
  pages: number = 1;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly bootstrapService: BootstrapService,
    private readonly imageService: ImageService,
    private readonly errorService: ErrorService,
    private readonly dialogService: DialogService,
  ) {}

  ngOnInit() {
    this.load().catch(this.logger.error);
  }

  private async load() {
    const params = this.route.snapshot.paramMap;

    let thispage = Number(params.get('page') ?? '');
    if (isNaN(thispage) || thispage <= 0) thispage = 1;
    this.page = thispage;

    this.subscribeMobile();

    const list = await this.imageService.ListMyImages(24, this.page - 1);
    if (HasFailed(list)) {
      return this.logger.error(list.getReason());
    }

    this.pages = list.pages;
    this.images = list.results;
  }

  @AutoUnsubscribe()
  private subscribeMobile() {
    return this.bootstrapService.screenSize().subscribe((size) => {
      if (size <= BSScreenSize.sm) {
        this.columns = 1;
      } else if (size <= BSScreenSize.lg) {
        this.columns = 2;
      } else {
        this.columns = 3;
      }
    });
  }

  getThumbnailUrl(image: EImage) {
    return (
      this.imageService.GetImageURL(image.id, ImageFileType.QOI) +
      '?height=480&shrinkonly=yes'
    );
  }

  viewImage(image: EImage) {
    this.router.navigate(['/view', image.id]);
  }

  async deleteImage(image: EImage) {
    const pressedButton = await this.dialogService.showDialog({
      title: `Are you sure you want to delete the image?`,
      description: 'This action cannot be undone.',
      buttons: [
        {
          name: 'cancel',
          text: 'Cancel',
        },
        {
          color: 'warn',
          name: 'delete',
          text: 'Delete',
        },
      ],
    });

    if (pressedButton === 'delete') {
      const result = await this.imageService.DeleteImage(image.id ?? '');
      if (HasFailed(result))
        return this.errorService.showFailure(result, this.logger);

      this.errorService.success('Image deleted');
      this.images = this.images?.filter((i) => i.id !== image.id) ?? null;
    }
  }

  gotoPage(page: number) {
    this.router.navigate(['/images', page]).then(() => {
      this.load().catch(this.logger.error);
    });
  }
}
