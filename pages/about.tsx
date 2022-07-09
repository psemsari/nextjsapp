const UserAgent = require('user-agents');
const fetchs = require('node-fetch');
const cookieParse = require('cookie');
const { HttpsProxyAgent } = require('https-proxy-agent');
import { ChakraProvider } from '@chakra-ui/react'

function About(props: {all: Article[]})
{

	return (
		<ChakraProvider>
		<div className="bg-white">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">SIBU official</h2>

        <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {props.all.map((product) => (
            <div key={product.id} className="group relative">
              <div className="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75 lg:h-80 lg:aspect-none">
                <img
                  src={product.photos[0].full_size_url}
                  alt={product.photos[0].id.toString()}
                  className="w-full h-full object-center object-cover lg:w-full lg:h-full"
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href={product.url}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product.title}
                    </a>
                  </h3>
                </div>
                <p className="text-sm font-medium text-gray-900">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
		</ChakraProvider>
	)
}

type Photo = {
	id: number;
	full_size_url: string;
	height: number;
	width: number;
}

type Article = {
	id: number;
	title: string;
	price: string;
	url: string;
	photos: Photo[];
}

type Articles = {
	items: Article[];
}

type Pagination = {
	current_page: number;
	total_pages: number;
	per_page: number;
	total_entries: number;
}

function getPhoto(photo : Photo)
{
	return {id: photo.id, full_size_url: photo.full_size_url, height: photo.height, width: photo.width}
}

function getArticle(item: Article)
{
	const photos: Photo[] = [];
	item.photos.forEach((value) => {photos.push(getPhoto(value))});
	return {id: item.id, title: item.title, price: item.price, url: item.url, photos: photos}
}

function getArticles(all: Articles)
{
	const items: Article[] = [];
	all.items.forEach((value) => {items.push(getArticle(value))});
	return items
}

function getPagination(posts: any)
{
	return {
		current_page: posts.pagination.current_page,
		total_pages: posts.pagination.total_pages,
		per_page: posts.pagination.per_page,
		total_entries: posts.pagination.total_entries
	}
}

export async function getStaticProps() {
	// Call an external API endpoint to get posts.
	// You can use any data fetching library
	const controller = new AbortController();
	const agent = new HttpsProxyAgent("https://51.195.76.214:3128")
	console.log(agent);
	const init = await fetchs('https://www.vinted.fr/', {
		agent,
		signal: controller.signal,
		headers: {
			'user-agent': new UserAgent().toString()
		}
	})
	console.log(init.status)
	console.log(init.headers.get('set-cookie'))
	const cookie : string = await init.headers.get('set-cookie') as string
	const auth = cookieParse.parse(cookie)['secure, _vinted_fr_session'];
	console.log(auth);
	let res = await fetch('https://www.vinted.fr/api/v2/users/71550545/items?per_page=96&page=1', {headers: {cookie: '_vinted_fr_session=' + auth}});
	console.log(res.status);
	let posts = await res.json()
	const pagination : Pagination = getPagination(posts);
	let all : Article[] = getArticles(posts);
	pagination.current_page++;
	while (pagination.current_page <= pagination.total_pages) {
		res = await fetch('https://www.vinted.fr/api/v2/users/71550545/items?per_page=96&page=' + pagination.current_page, {headers: {cookie: '_vinted_fr_session=' + auth}});
		posts = await res.json();
		all = [...all, ...getArticles(posts)];
		pagination.current_page++;
	}

	// By returning { props: { posts } }, the Blog component
	// will receive `posts` as a prop at build time
	return {
		props: {all}
	}
}

export default About
