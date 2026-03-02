# 2009 AMC 12A Problem 24

## Problem
The *tower function of twos* is defined recursively as follows: T(1) = 2 and T(n + 1) = $2^{T(n)}$ for $n\ge1.$ Let A = (T($2009))^{T(2009)}$ and B = (T(2009))^A. What is the largest integer k for which \underbrace{$\log_2\log_2\log_2\ldots\log_$2B}_{k$\text{ times}$} is defined?

$\textbf{(A)}\ 2009\qquad \textbf{(B)}\ 2010\qquad \textbf{(C)}\ 2011\qquad \textbf{(D)}\ 2012\qquad \textbf{(E)}\ 2013$
## Solution (not a proof, but good enough for AMCs)
Testing the first two (or three) positive integers instead of 2009, k seems to always be 4 more. Put E and go on to tackle #25 :)
*~dolphin7*
## Solution
We just look at the last three logarithms for the moment, and use the fact that $\log_2 T(k) = T(k - 1).$ We wish to find:

$$
\begin{align*} \log_2\log_2\log_2\left({T(2009)^{\left({T(2009)}^{T(2009)}\right)}}\right) &= \log_2(T(2009)\log_2(T(2009)\log_2 T(2009)))\\ &= \log_2(T(2009)\log_2(T(2009)T(2008)))\\ &= \log_2 \{ T(2009) [ T(2008) + T(2007) ] \} \\ \end{align*}
$$


Now we realize that T(n - 1) is much smaller than T(n). So we approximate this, remembering we have rounded down, as:

$$\log_2(T(2009)) = T(2008)$$
We have used 3 logarithms so far. Applying 2007 more to the left of our expression, we get T(1) = 2. Then we can apply the logarithm 2 more times, until we get to 0. So our answer is approximately $3 + 2007 + 2 = 2012$. But we rounded down, so that means that after 2012 logarithms we get a number slightly greater than 0, so we can apply logarithms one more time. We can be sure it is small enough so that the logarithm can only be applied 1 more time since $2012 + 1 = 2013$ is the largest answer choice. So the answer is $\mathbf{(E)}.$

EDIT: Why use answer choices? @above solution should explain at the end WHY they can be sure.
## Alternative Solution
Let $L_k(x)=\log_2\log_2...\log_2(x)$ where there are k $\log_$2's. $L_k(B)$ is defined iff (if and only if) $L_{k-1}(B) > 0$ iff $L_{k-2}(B) > 1$. Note $\log_2 T(k) = T(k - 1),$ so $L_{k-2}(T(k-2$))=1. Thus, we seek the largest k such that B > T$(k-2)$. Now note that

$$T(2009)^{T(2009)^{T(2009)}} > 2^{2^{T(2009)}} = T(2011)$$

so $k=2013$ satisfies the inequality. Since it is the largest choice, it is the answer.
## Clarification
(Note: This for the people who need clear, concise reasoning in the form of mostly words, instead of a compact proof written in set theory symbols and the like. I figured if I had trouble understanding the above solutions, others would too.)

We begin by contemplating what B actually is. Calculating the first few values of T(n), we see that it quickly becomes absolutely, massively, well, MASSIVE. So actually calculating T(2009), is sadly, not an option (this is a final five problem, after all). Next we consider if it is possible to express B differently. We have:

B = T($2009)^{T(2009)^{T(2009)}}\Rightarrow \text{calculating.... ERROR}$

(I didn't actually try plug it into a computer program; the point is, it's not that easy)

So, the only thing left to do is jump right into the problem. We start by applying the \logs one at a time, and seeing where it goes. We have:

$$\log_2{\left(T(2009)^{\left(T(2009)^{T(2009)}\right)}\right)}$$

(Uhhhhhh....)

But wait! We can use the rule $\log_b{x^y} =y*\log_b{x}.$ Then the expression becomes

$$(T(2009)^{T(2009)}*\log_2{T(2009)} \Rightarrow (T(2009)^{T(2009)}*T(2008)$$

(because $\log_2{T(n)} =$ {T(n-1)$$})

Now we try \loging it again:

$$\log_2{(T(2009)^{T(2009)}*T(2008)}.$$

This time, we can make use of the $\log$ addition rule $\log_b{x*y} = \log_b{x}+\log_b{y}.$ The expression becomes

$$\log_2{(T(2009)^{T(2009)})} + \log_2{T(2008)}$$

Pulling out the exponent again and further simplifying, we have

$$\log_2{(\log_2{(B)})} = T(2009)*T(2008)+T(2007)$$

Now we $\log$ it a third time... and we're stuck 😐. There is no pretty formula for taking the $\log$ of two things added together. So we rack our brains, sigh in frustration... and give up.

JUST KIDDING! (Don't give up)

Whenever you get stuck, you want to "zoom out" and re-gain perspective of what it is you're actually trying to find. The problem asks us to find the number of times we can keep taking the $\log$ of this expression, until we no longer can (once you reach a negative value, you can't take the log of it anymore; i.e. \logs are only defined for positive inputs). So, for the context of this problem, what we want to know is:

"How many times can I take the $\log$ of B and get a positive value?"

Let's think about what $\log$ actually means. We want a number x, such that when 2 is raised to the power of x, we get the expression in the $\log.$ So, when we think about

$$\log_2{T(2009)*T(2008)+T(2007)}$$

What actually matters? Well, even if you have a big number, say, 124986068, what happens when you raise 2 to the power of that number? We would end up getting another one of these:

Calculating... ERROR

(lol 🤣)

But in all seriousness, whenever we consider tower functions, the next tower number is always much, much bigger. So, back to the problem:

$$\log_2{(T(2009)*T(2008)+T(2007))}$$

T(2007) is huge... but when you put it next to T(2008), it looks like an ant. Even more so when it's next to T(2009)*T(2008). So... what does that mean? Well, if we could get rid of the T(2007), we could at least go another step. So... let's get rid of it! (At this point I can almost see the audience: *surprised pikachu face)

$\text{WARNING: THIS SECTION IS FOR CALCULUS USERS ONLY}$

(Just kidding, but yes, the following part of the explanation does incorporate some calculus-related ideas)

If we were to consider just

$$\log_2{(T(2009)*T(2008))}$$

we would get

$$\log_2{T(2009)} + \log_2{T(2008)} \Rightarrow T(2008) + T(2007)$$

But what if we wanted to get

T(2008) + T(2007)+1

as our answer? What would the argument have to be? (In this context, "argument" refers to the value in the parentheses). Well, we can work backwards:

T(2008) + T(2007)+1

$$\Rightarrow \log_2{T(2009)} + \log_2{T(2008)} + \log_2{2}$$

$$\Rightarrow \log_2{(T(2009)*T(2008)*2)}$$

So the argument would have to be at least

$$2*T(2009)*T(2008) = T(2009)*T(2008)+T(2009)*T(2008)$$

But when we compare

T(2009)*T(2008)+T(2009)*T(2008)

to

T(2009)*T(2008)+T(2007)

Clearly

T(2009)*T(2008) > T(2007)

So,

$$\log_2{(T(2009)*T(2008)+T(2007))}$$

equals some value between

T(2008) + T(2007)

and

T(2008) + T(2007) + 1

Let's call that small excess value $\varepsilon (l$owercase epsilon, literally "infinitely small but not 0"). We want to keep taking the $\log$ of the expression, and $\varepsilon$ is going to be pitifully small compared to T(2008) or T(2007). So, within the context of this problem,

$$T(2008) + T(2007) + \varepsilon \approx T(2008) + T(2007)$$

Now we take the $\log$ again:

$$\log_2{(T(2008)+T(2007))}$$

Look familiar? It should, because this is almost exactly the same scenario as the one I just made a big fuss about (Take that, you no-know-calculus noobs! On an off note, it's completely fine if you don't know calculus; AMC problems are supposed to solvable by students who don't know calculus.) So, applying the same idea as earlier we have

$$\log_2{(T(2008)+T(2007))} \approx \log_2{T(2008)}$$

From here on out, it's calm waters. To recap,

$$\log_2{(\log_2{(\log_2{(B)})})} \approx T(2008)$$

Taking the $\log 2007$ more times(for a total of 2010), we get

$$\log_2\log_2... T(2008) = T(1) = 2$$

Taking the log again, we get

$$\log_2{2} = 1$$

(Now we're at 2011 times)

Once more and we have

$$\log_2{1} = 0.$$

(2012 times)

But wait, there's more! (IYKYK lol) Remember how we ignored the $\varepsilon$? Well, It's time to bring it back. Every time we took the log, we would get T($\text{something}) + \varepsilon$ because we defined $\varepsilon$ to be some very, very small (but finite) number. Let's go back a few steps:

$$\log_2{2} = 1$$

should really be

$$\log_2{(2+\varepsilon)} = 1+\epsilon$$

and

$$\log_2{1} = 0$$

should really be

$$\log_2{(1+\varepsilon)} = \varepsilon$$

Since $\varepsilon$ is still a positive number, we can take the $\log$ of it one last time before it becomes negative. So, after a long and very tiring journey (for both you, the reader, and me, the writer) we have k (the number of times we took the $\log) = 2013 \Rightarrow \boxed{\text{E}}.$
*~TheAsian*
## See also
