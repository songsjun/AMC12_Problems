# 2017 AMC 12A Problem 23

## Problem
For certain real numbers a, b, and c, the polynomial $g(x) = x^3$ + ax^2 + x + 10has three distinct roots, and each root of g(x) is also a root of the polynomial $f(x) = x^4 + x^3 + bx^2 +100x$ + c.What is f(1)?

$\textbf{(A)}\ -9009 \qquad\textbf{(B)}\ -8008 \qquad\textbf{(C)}\ -7007 \qquad\textbf{(D)}\ -6006 \qquad\textbf{(E)}\ -5005$
## Solution
Let $r_1,r_2$, and $r_3$ be the roots of g(x). Let $r_4$ be the additional root of f(x). Then from Vieta's formulas on the quadratic term of g(x) and the cubic term of f(x), we obtain the following:


$$
\begin{align*} r_1+r_2+r_3&=-a \\ r_1+r_2+r_3+r_4&=-1 \end{align*}
$$


Thus $r_4=a-1$.

Now applying Vieta's formulas on the constant term of g(x), the linear term of g(x), and the linear term of f(x), we obtain:


$$
\begin{align*} r_1r_2r_3 & = -10\\ r_1r_2+r_2r_3+r_3r_1 &= 1\\ r_1r_2r_3+r_2r_3r_4+r_3r_4r_1+r_4r_1r_2 & = -100\\ \end{align*}
$$


Substituting for $r_1r_2r_3$ in the bottom equation and factoring the remainder of the expression, we obtain:

$$-10+(r_1r_2+r_2r_3+r_3r_1)r_4=-10+r_4=-100$$

It follows that $r_4=-90. But r_4=a-1$ so a=-89

Now we can factor f(x) in terms of g(x) as

$$f(x)=(x-r_4)g(x)=(x+90)g(x)$$

Then f(1)=$91g(1)$ and

$$g(1)=1^3-89\cdot 1^2+1+10=-77$$

Hence f(1)=$91\cdot(-77)=\boxed{\textbf{(C)}\,-7007}.$
## Solution 2
Since all of the roots of g(x) are distinct and are roots of f(x), and the degree of f is one more than the degree of g, we have that

$$f(x) = C(x-k)g(x)$$

for some number k. By comparing $x^4$ coefficients, we see that C=1. Thus,

$$x^4+x^3+bx^2+100x+c=(x-k)(x^3+ax^2+x+10)$$

Expanding and equating coefficients we get that

$$a-k=1,1-ak=b,10-k=100,-10k=c$$

The third equation yields k=-90, and the first equation yields a=-89. So we have that

$$f(1)=(1+90)g(1)=91(1-89+1+10)=(91)(-77)=\boxed{\textbf{(C)}\,-7007}$$
## Solution 3
Let the roots of g(x) be p,q,r and the roots of f(x) be p,q,r,s. Then by Vietas, -100=pqr+pqs+prs+qrs = -10+ s(pq+pr+rs) = -10 + s,so s = -90. Again by Vietas, p+q+r+s = -a + s = -1 $\implies$ a = -89. Finally, f(1) = (1-(-90))g(1) = $\textbf{(C)}$\,-7007.
## Solution 4
f(x) must have four roots, three of which are roots of g(x). Using the fact that every polynomial has a unique factorization into its roots, and since the leading coefficient of f(x) and g(x) are the same, we know that

$$f(x)=g(x)(x-r)$$

where $r\in\mathbb{C}$ is the fourth root of f(x). Substituting g(x) and expanding, we find that


$$
\begin{align*}f(x)&=(x^3+ax^2+x+10)(x-r)\\ &=x^4+(a-r)x^3+(1-ar)x^2+(10-r)x-10r.\end{align*}
$$


Comparing coefficients with f(x), we see that


$$
\begin{align*} a-r&=1\\ 1-ar&=b\\ 10-r&=100\\ -10r&=c.\\ \end{align*}
$$


(Solution 1.1 picks up here.)

Let's solve for a,b,c, and r. Since 10-$r=100$, r=-90, so c=(-10)(-90)=900. Since a-$r=1$, a=-89, and $b=1$-ar=-8009. Thus, we know that

$$f(x)=x^4+x^3-8009x^2+100x+900.$$

Taking f(1), we find that


$$
\begin{align*} f(1)&=1^4+1^3-8009(1)^2+100(1)+900\\ &=1+1-8009+100+900\\ &=\boxed{\bold{(C)}\, -7007}.\\ \end{align*}
$$

## Solution 5
A faster ending to Solution 1 is as follows.
We shall solve for only a and r. Since 10-$r=100$, r=-90, and since a-$r=1$, a=-89. Then,

$$
\begin{align*} f(1)&=(1-r)(1^3+a\cdot1^2+1+10)\\ &=(91)(-77)\\ &=\boxed{\bold{(C)}\, -7007}.\\ \end{align*}
$$

## Solution 6 (Fast)
Let the term q(x) be the linear term that we are solving for in the equation $f(x)=g(x)\cdot$ q(x). Now, we know that $q(x)=mx-r$ must have $m=1$, because only x $\cdotx^3=x^4. In$ addition, we know that, by distributing, $10x-rx=100x$. Therefore, r=-90, and all the other variables are quickly solved for.
## Solution 7
We notice that the constant term of $f(x)=c$ and the constant term in $g(x)=10.$ Because f(x) can be factored as g(x) $\cdot (x- r) (w$here r is the unshared root of f(x), we see that using the constant term, -10 $\cdot$ r = c and therefore $r =-\frac{c}{10}.$
Now we once again write f(x) out in factored form:

$$f(x) = g(x)\cdot (x-r) = (x^3+ax^2+x+10)\left(x+\frac{c}{10}\right).$$

We can expand the expression on the right-hand side to get:


$$f(x) = x^4+\left(a+\frac{c}{10}\right)x^3+\left(1+\frac{ac}{10}\right)x^2+\left(10+\frac{c}{10}\right)x+c$$


Now we have f(x) = $x^4+\left(a+\frac{c}{10}\right)x^3+\left(1+\frac{ac}{10}\right)x^2+\left(10+\frac{c}{10} \right)x+c=x^4+x^3+bx^2+100x$+c.

Simply looking at the coefficients for each corresponding term (knowing that they must be equal), we have the equations:

$$
10+\frac{c}{10}=100 \Rightarrow c=900
a+\frac{c}{10} = 1, c=900 \Rightarrow a + 90 =1 \Rightarrow a= -89
$$


and finally,

$$1+\frac{ac}{10} = b = 1+\frac{-89 \cdot 900}{10} = b = -8009.$$

We know that f(1) is the sum of its coefficients, hence 1+1+$b+100$+c. We substitute the values we obtained for b and c into this expression to get f(1) = 1 + 1 + (-8009) + 100 + $900 =\boxed{\textbf{(C)}\,-7007}.$
## Solution 8
Let $r_1,r_2$, and $r_3$ be the roots of g(x). Let $r_4$ be the additional root of f(x). Then from Vieta's formulas on the quadratic term of g(x) and the cubic term of f(x), we obtain the following:


$$
\begin{align*} r_1+r_2+r_3&=-a \\ r_1+r_2+r_3+r_4&=-1 \end{align*}
$$


Thus $r_4=a-1$.

Now applying Vieta's formulas on the constant term of g(x), the linear term of g(x), and the linear term of f(x), we obtain:


$$
\begin{align*} r_1r_2r_3 & = -10\\ r_1r_2+r_2r_3+r_3r_1 &= 1\\ r_1r_2r_3+r_2r_3r_4+r_3r_4r_1+r_4r_1r_2 & = -100\\ \end{align*}
$$


Substituting for $r_1r_2r_3$ in the bottom equation and factoring the remainder of the expression, we obtain:

$$-10+(r_1r_2+r_2r_3+r_3r_1)r_4=-10+r_4=-100$$

It follows that $r_4=-90. But r_4=a-1$ so a=-89

Now we can factor f(x) in terms of g(x) as

$$f(x)=(x-r_4)g(x)=(x+90)g(x)$$

Then f(1)=$91g(1)$ and

$$g(1)=1^3-89\cdot 1^2+1+10=-77$$

Hence f(1)=$91\cdot(-77)=\boxed{\textbf{(C)}\,-7007}.$
## Solution 9 (Risky)
Let the roots of g(x) be $r_1, r_2$, and $r_3$. Let the roots of f(x) be $r_1, r_2, r_3$, and $r_4$. From Vieta's, we have:

$$
\begin{align*} r_1+r_2+r_3=-a \\ r_1+r_2+r_3+r_4=-1 \\ r_4=a-1 \end{align*}
$$

The fourth root is $a-1$. Since $r_1, r_2$, and $r_3$ are common roots, we have:

$$
\begin{align*} f(x)=g(x)(x-(a-1)) \\ f(1)=g(1)(1-(a-1)) \\ f(1)=(a+12)(2-a) \\ f(1)=-(a+12)(a-2) \\ \end{align*}
$$

Let $a-2$=k:

$$
\begin{align*} f(1)=-k(k+14) \end{align*}
$$

Note that $-7007=-1001\cdot(7)=-(7\cdot(11)\cdot(13))\cdot(7)=-91\cdot(77)$
This gives us a pretty good guess of $\boxed{\textbf{(C)}\, -7007}.$
## Solution 10
First off, let's get rid of the $x^4$ term by finding $h(x)=f(x)-xg(x).$ This polynomial consists of the difference of two polynomials with 3 common factors, so it must also have these factors. The polynomial is $h(x)=(1-a)x^3 + (b-1)x^2 + 90x$ + c, and must be equal to (1-a)g(x). Equating the coefficients, we get 3 equations. We will tackle the situation one equation at a time, starting the x terms. Looking at the coefficients, we get $\dfrac{90}{1-a} = 1.$
$$\therefore 90=1-a.$$
The solution to the previous is obviously a=-89. We can now find b and c. $\dfrac{b-1}{1-a} =$ a,
$$\therefore b-1=a(1-a)=-89\cdot90=-8010$$
and b=-8009. Finally $\dfrac{c}{1-a} = 10,$
$$\therefore c=10(1-a)=10\cdot90=900$$
Solving the original problem, f(1)=1 + 1 + b + 100 + $c =102+b+c=102+900-8009=\boxed{\textbf{©}\, -7007}.$
## Solution 11
Simple polynomial division is a feasible method. Even though we have variables, we can equate terms at the end of the division so that we can cancel terms. Doing the division of $\frac{f(x)}{g(x)}$ eventually brings us the final step $(1-a)x^3 + (b-1)x^2 + 90x$ + c minus $(1-a)x^3 - (a-a^2)x^2 + (1-a)x +10(1-a)$ after we multiply f(x) by (1-a). Now we equate coefficients of same-degree x terms. This gives us  $10(1-a)$ = c, $b-1 = a - a^2, 1-a = 90\Rightarrow$ a = -89, $c = 900$, b = -8009. We are interested in finding f(1), which equals $1^4 + $1^3 -$8009\cdot1^2 + 100\cdot1 + 900 = \boxed{\textbf{(C)}\,-7007}.$ ~skyscraper
## Note
Note that f(1) for any polynomial is simply the sum of the coefficients of the polynomial.
## Video Solution 1
https://youtu.be/MBIiz0mroqk
## Video Solution 2
https://youtu.be/3dfbWzOfJAI?t=4412
*~pi_is_3.14*
## Video Solution 3 by Punxsutawney Phil
https://youtu.be/i1GpjPXtrPA
## See Also
