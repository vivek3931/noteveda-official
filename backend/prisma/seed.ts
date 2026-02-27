import { PrismaClient, BillingInterval } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const plans = [
        {
            name: 'Free',
            description: 'Essential features for students getting started.',
            price: 0,
            interval: BillingInterval.MONTHLY,
            features: [
                'Access to basic study materials',
                '5 downloads per month',
                'Basic search functionality',
                'Community support',
            ],
            cta: 'Get Started',
            ctaLink: '/signup',
            isPopular: false,
        },
        {
            name: 'Pro Monthly',
            description: 'Supercharge your learning with advanced features.',
            price: 299,
            interval: BillingInterval.MONTHLY,
            features: [
                'Unlimited downloads',
                'Ad-free experience',
                'Priority support',
                'Advanced analytics',
                'Early access to new resources',
            ],
            cta: 'Upgrade to Pro',
            ctaLink: '/checkout?plan=pro-monthly',
            isPopular: true,
            badge: 'Most Popular',
            highlighted: true,
        },
        {
            name: 'Pro Yearly',
            description: 'Best value for committed learners.',
            price: 2999,
            interval: BillingInterval.YEARLY,
            features: [
                'All Pro Monthly features',
                '2 months free',
                'Exclusive webinars',
            ],
            cta: 'Go Yearly',
            ctaLink: '/checkout?plan=pro-yearly',
            isPopular: false,
            badge: 'Best Value',
            highlighted: true,
        },
    ];

    for (const plan of plans) {
        const existing = await prisma.plan.findFirst({
            where: { name: plan.name },
        });
        if (!existing) {
            await prisma.plan.create({
                data: plan,
            });
            console.log(`Created plan: ${plan.name}`);
        } else {
            // Update existing plan to match seed (optional, but good for dev)
            await prisma.plan.update({
                where: { id: existing.id },
                data: plan
            });
            console.log(`Updated plan: ${plan.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
