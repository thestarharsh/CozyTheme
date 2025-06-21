import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Star, Target } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <main className="container mx-auto px-4 md:px-6 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            About CozyGripz
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            Bringing comfort and style to your fingertips. We believe that your phone should be an extension of your personality.
          </p>
        </section>

        {/* Our Story & Mission */}
        <section className="grid md:grid-cols-2 gap-12 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-primary" />
                Our Story
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 dark:text-gray-300">
              <p>
                Founded in 2025, CozyGripz started with a simple idea: phone accessories can be both functional and beautiful. We were tired of bulky, generic cases and grips that hid the sleek design of our phones. We wanted to create something better - something that felt personal.
              </p>
              <p className="mt-4">
                From a small workshop to a growing online store, our passion for design and quality has driven us forward. Every CozyGripz product is designed with you in mind.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 dark:text-gray-300">
              <p>
                Our mission is to provide you with high-quality, stylish, and comfortable phone accessories that you'll love. We are committed to:
              </p>
              <ul className="mt-4 space-y-2 list-disc list-inside">
                <li>Creating unique and trendy designs.</li>
                <li>Using premium materials for durability.</li>
                <li>Ensuring a comfortable and secure grip.</li>
                <li>Providing excellent customer service.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Find Your Perfect Grip
          </h2>
          <p className="mt-3 max-w-md mx-auto text-gray-500 dark:text-gray-400">
            Ready to give your phone a new look? Browse our collection of unique phone grips and cases.
          </p>
          <div className="mt-8">
            <Link href="/products">
              <Button size="lg">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutUs; 