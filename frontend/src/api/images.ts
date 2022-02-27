import { ImageUploadRequest } from '../frontenddto/imageroute.dto';
import PicsurApi from './api';
import { EImage } from 'picsur-shared/dist/entities/image.entity';
import { AsyncFailable, HasFailed } from 'picsur-shared/dist/types';

export interface ImageLinks {
  source: string;
  markdown: string;
  html: string;
  rst: string;
  bbcode: string;
}
export default class ImagesApi extends PicsurApi {
  public static readonly I = new ImagesApi();

  protected constructor() {
    super();
  }

  public async UploadImage(image: File): AsyncFailable<string> {
    const result = await this.api.postForm(
      EImage,
      '/i',
      new ImageUploadRequest(image),
    );

    if (HasFailed(result)) return result;

    return result.hash;
  }

  public async GetImageMeta(image: string): AsyncFailable<EImage> {
    return await this.api.get(EImage, `/i/meta/${image}`);
  }

  public static GetImageURL(image: string): string {
    const baseURL = window.location.protocol + '//' + window.location.host;

    return `${baseURL}/i/${image}`;
  }

  public static CreateImageLinks(imageURL: string) {
    return {
      source: imageURL,
      markdown: `![image](${imageURL})`,
      html: `<img src="${imageURL}" alt="image">`,
      rst: `.. image:: ${imageURL}`,
      bbcode: `[img]${imageURL}[/img]`,
    };
  }
}
